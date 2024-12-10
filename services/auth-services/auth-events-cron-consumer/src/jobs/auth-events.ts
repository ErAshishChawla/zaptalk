import {
  AuthServiceEvent,
  EventQueueConfig,
  EventStatus,
  EventQueue,
} from "@eraczaptalk/zaptalk-common";
import { DateTime, DurationLikeObject } from "luxon";

import { AppDataSource } from "../utils/db";
import { winstonLogger } from "../utils/logger";
import { AuthEventsKafkaSingleProducer } from "../kafka/producers/auth-events-kafka-batch-producer";
import { jobConfig } from "../utils/config";

export const consumeAuthEvents = async (batchSize: number) => {
  try {
    // Fetch the pending and failed events
    const authServiceEventsRepository =
      AppDataSource.getRepository(AuthServiceEvent);

    // Get Pending events
    const pendingEvents = await authServiceEventsRepository
      .createQueryBuilder("event")
      .where("event.status = :pendingStatus AND event.lockExpiration IS NULL", {
        pendingStatus: EventStatus.PENDING,
      })
      .orWhere(
        "event.status = :processingStatus AND event.lockExpiration < :currentUtcTime",
        {
          processingStatus: EventStatus.PROCESSING,
          currentUtcTime: DateTime.utc().toJSDate(),
        }
      )
      .take(Math.floor(batchSize * 0.7))
      .getMany();

    // Get Failed events
    const failedEvents = await authServiceEventsRepository
      .createQueryBuilder("event")
      .where("event.status = :failedStatus", {
        failedStatus: EventStatus.FAILED,
      })
      .take(Math.floor(batchSize * 0.3))
      .orderBy("RANDOM()")
      .getMany();

    // Combine the pending and failed events
    const combinedEvents = [...pendingEvents, ...failedEvents];

    // Check if there are any events to process
    if (combinedEvents.length === 0) {
      winstonLogger.info("No events found");
      return;
    }

    // Process events in parallel
    await Promise.allSettled(
      combinedEvents.map(async (event): Promise<void> => {
        // Lock the event
        await AppDataSource.transaction(async (transactionEntityManager) => {
          event.lockExpiration = DateTime.utc()
            .plus(jobConfig.lockExpiration)
            .toJSDate();
          event.status = EventStatus.PROCESSING;
          await transactionEntityManager.save(event);
          winstonLogger.info(
            `Event with id ${event.id} status updated to processing`
          );
        });

        // Process the event
        winstonLogger.info(`Processing event with id ${event.id}`);

        let isEventProcessed = false;
        const authEventsKafkaSingleProducer =
          AuthEventsKafkaSingleProducer.getInstance();

        // Process the event
        try {
          await Promise.race([
            await authEventsKafkaSingleProducer.sendMessage(
              event.topic,
              event.payload
            ),
            new Promise((resolve, reject) => {
              setTimeout(() => {
                reject(new Error("Event processing Timeout"));
              }, jobConfig.timeoutMs);
            }),
          ]);
          isEventProcessed = true;
          winstonLogger.info(
            `Event with id ${event.id} processed successfully`
          );
        } catch (error) {
          winstonLogger.error(
            `Error processing event: ${error} due to processing`
          );
        }

        // Check if event is processed
        if (isEventProcessed) {
          // Update the event status to completed
          await AppDataSource.transaction(async (transactionEntityManager) => {
            event.status = EventStatus.COMPLETED;
            event.lockExpiration = null;
            await transactionEntityManager.save(event);
            winstonLogger.info(
              `Event with id ${event.id} status updated to completed`
            );
          });
        } else {
          // Check if the event has reached the retry limit
          if (event.retryCount >= jobConfig.retryLimit) {
            await AppDataSource.transaction(
              async (transactionEntityManager) => {
                event.status = EventStatus.FAILED;
                event.lockExpiration = null;
                await transactionEntityManager.save(event);
                winstonLogger.info(
                  `Event with id ${event.id} status updated to failed`
                );
              }
            );

            return;
          }

          // Update the event status to failed
          await AppDataSource.transaction(async (transactionEntityManager) => {
            event.status = EventStatus.PENDING;
            event.lockExpiration = null;
            event.retryCount = event.retryCount + 1;
            await transactionEntityManager.save(event);
            winstonLogger.info(
              `Event with id ${event.id} status updated to pending with retry count ${event.retryCount}`
            );
          });
        }
      })
    );
  } catch (error) {
    winstonLogger.error("Failed to consume the events", error);
  }
};
