import {
  EventQueue,
  QueueConsumer,
  IAuthServiceEvent,
  AuthServiceEvent,
  EventStatus,
  EventRetryLimits,
  EventLockDurationInMin,
  EventTopic,
} from "@eraczaptalk/zaptalk-common";
import { Connection, ConsumeMessage } from "amqplib";
import { AppDataSource } from "../utils/db";
import { winstonLogger } from "../utils/logger";
import { DateTime } from "luxon";
import { authEventsKafkaSingleProducer } from "../kafka/producers";

const EVENT_RETRY_LIMIT = EventRetryLimits[EventQueue.authQueue];
const EVENT_LOCK_EXPIRATION = 2;

export class AuthConsumer extends QueueConsumer<IAuthServiceEvent> {
  queueName: EventQueue = EventQueue.authQueue;

  constructor(connection: Connection) {
    super(connection);

    Object.setPrototypeOf(this, AuthConsumer.prototype);
  }

  async onMessage(
    data: IAuthServiceEvent,
    message: ConsumeMessage
  ): Promise<void> {
    if (!this.channel) {
      throw new Error("Channel not found");
    }

    winstonLogger.info(`Received message with id ${data.id}`);

    const ackCases = {
      ack: false,
      nack: false,
      nackAndRequeue: false,
    };

    const authServiceEventsRepository =
      AppDataSource.manager.getRepository(AuthServiceEvent);

    try {
      // Lets fetch the event from the database and process it
      const existingEvent = await authServiceEventsRepository.findOne({
        where: { id: data.id },
      });

      // If the event does not exist, we will nack this message and not requeue
      if (!existingEvent) {
        winstonLogger.error(`Event with id ${data.id} not found`);
        ackCases.nack = true;
        return;
      }
      // If event status is completed, it means cron job is already processed we can ack this message
      if (existingEvent.status === EventStatus.COMPLETED) {
        winstonLogger.info(`Event with id ${data.id} already processed`);
        ackCases.ack = true;
      } else if (existingEvent.status === EventStatus.PROCESSING) {
        winstonLogger.info(`Event with id ${data.id} is already processing`);
        ackCases.nackAndRequeue = true;
      } else if (existingEvent.status === EventStatus.FAILED) {
        winstonLogger.info(`Event with id ${data.id} has failed status`);
        ackCases.nack = true;
      } else if (existingEvent.status === EventStatus.PENDING) {
        // Move the event to processing state and add lockExpiration
        await AppDataSource.transaction(async (transactionalEntityManager) => {
          existingEvent.status = EventStatus.PROCESSING;
          existingEvent.lockExpiration = DateTime.utc()
            .plus({ minutes: EVENT_LOCK_EXPIRATION })
            .toJSDate();
          await transactionalEntityManager.save(existingEvent);
        });

        winstonLogger.info(
          `Event with id ${data.id} status updated to processing and expiration time: ${existingEvent.lockExpiration}`
        );

        // Now the event is in processing state, we will process the event
        let isEventProcessed = false;
        try {
          await Promise.race([
            await authEventsKafkaSingleProducer.sendMessage(
              existingEvent.topic,
              existingEvent.payload
            ),
            new Promise<void>((resolve, reject) => {
              setTimeout(() => {
                winstonLogger.error(
                  `Event with id ${data.id} failed due to timeout`
                );
                reject(new Error("Failed to process event"));
              }, EVENT_LOCK_EXPIRATION * 60000 - 10000);
            }),
          ]);

          isEventProcessed = true;
        } catch (error) {
          winstonLogger.error(
            `Error processing event: ${error} due to processing`
          );
        }

        // Check if event is processed
        if (isEventProcessed) {
          await AppDataSource.transaction(
            async (transactionalEntityManager) => {
              existingEvent.status = EventStatus.COMPLETED;
              existingEvent.lockExpiration = null;
              await transactionalEntityManager.save(existingEvent);
              winstonLogger.info(
                `Event with id ${data.id} status updated to completed`
              );
            }
          );

          ackCases.ack = true;
        } else {
          const retryCount = existingEvent.retryCount;
          if (retryCount >= EVENT_RETRY_LIMIT) {
            await AppDataSource.transaction(
              async (transactionalEntityManager) => {
                existingEvent.status = EventStatus.FAILED;
                existingEvent.lockExpiration = null;
                await transactionalEntityManager.save(existingEvent);
                winstonLogger.info(
                  `Event with id ${data.id} status updated to failed`
                );
              }
            );
            ackCases.nack = true;
          } else {
            await AppDataSource.transaction(
              async (transactionalEntityManager) => {
                existingEvent.status = EventStatus.PENDING;
                existingEvent.lockExpiration = null;
                existingEvent.retryCount = retryCount + 1;
                await transactionalEntityManager.save(existingEvent);
                winstonLogger.info(
                  `Event with id ${data.id} status updated to pending with retry count: ${existingEvent.retryCount}`
                );
              }
            );
            ackCases.nackAndRequeue = true;
          }
        }
      } else {
        winstonLogger.error(`Event with id ${data.id} has invalid status`);
        ackCases.nack = true;
      }

      if (ackCases.ack) {
        this.channel.ack(message);
      } else if (ackCases.nack) {
        this.channel.nack(message, false, false);
      } else if (ackCases.nackAndRequeue) {
        this.channel.nack(message, false, true);
      }
    } catch (error) {
      winstonLogger.error(`Error processing event: ${error}`);
      ackCases.nackAndRequeue = true;
    }
  }
}
