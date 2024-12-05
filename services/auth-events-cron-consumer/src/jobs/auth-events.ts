import {
  AuthServiceEvent,
  EventRetryLimits,
  EventStatus,
  EventQueue,
  EventLockDurationInMin,
} from "@eraczaptalk/zaptalk-common";
import { DateTime } from "luxon";

import { AppDataSource } from "../utils/db";
import { winstonLogger } from "../utils/logger";

const EVENT_RETRY_LIMIT = EventRetryLimits[EventQueue.authQueue];
const EVENT_LOCK_EXPIRATION = EventLockDurationInMin[EventQueue.authQueue];

export const consumeAuthEvents = async (batchSize: number) => {
  try {
    // Fetch the pending and failed events
    const authServiceEventsRepository =
      AppDataSource.getRepository(AuthServiceEvent);

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

    console.log("pendingEvents", pendingEvents);

    // Get Failed events
    const failedEvents = await authServiceEventsRepository
      .createQueryBuilder("event")
      .where("event.status = :failedStatus", {
        failedStatus: EventStatus.FAILED,
      })
      .take(Math.floor(batchSize * 0.3))
      .getMany();
    console.log("failedEvents", failedEvents);

    const combinedEvents = [...pendingEvents, ...failedEvents];

    if (combinedEvents.length === 0) {
      winstonLogger.info("No events found");
      return;
    }

    // Update the events to processing
    const results = await Promise.allSettled(
      combinedEvents.map(async (event): Promise<void> => {
        await AppDataSource.transaction(async (transactionEntityManager) => {
          event.lockExpiration = DateTime.utc()
            .plus({ minutes: EVENT_LOCK_EXPIRATION })
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
        try {
          await Promise.race([
            new Promise<void>((resolve, reject) => {
              const random = Math.floor(Math.random() * 10);
              setTimeout(() => {
                if (random % 2 === 0) {
                  winstonLogger.info(`Event with id ${event.id} processed`);
                  resolve();
                } else {
                  winstonLogger.error(`Event with id ${event.id} failed`);
                  reject(new Error("Failed to process event"));
                }
              }, random * 10000);
            }),
            new Promise<void>((resolve, reject) => {
              setTimeout(() => {
                winstonLogger.error(
                  `Event with id ${event.id} failed due to timeout`
                );
                reject(new Error("Failed to process event"));
              }, EVENT_LOCK_EXPIRATION * 60000 - 10000);
            }),
          ]);

          isEventProcessed = true;
        } catch (error) {
          winstonLogger.error(
            `Failed to process event with id ${event.id}`,
            error
          );
        }

        // Check if event is processed
        if (isEventProcessed) {
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
          if (event.retryCount >= EVENT_RETRY_LIMIT) {
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

        return;
      })
    );

    console.log(results);
  } catch (error) {
    winstonLogger.error("Failed to consume the events", error);
  }
};
