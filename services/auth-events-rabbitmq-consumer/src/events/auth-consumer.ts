import {
  EventQueue,
  QueueConsumer,
  IAuthServiceEvent,
} from "@eraczaptalk/zaptalk-common";
import { ConsumeMessage } from "amqplib";

export class AuthConsumer extends QueueConsumer<IAuthServiceEvent> {
  queueName: EventQueue = EventQueue.authQueue;

  async onMessage(
    data: IAuthServiceEvent,
    message: ConsumeMessage
  ): Promise<void> {
    console.log("Received message: ", data);
  }
}
