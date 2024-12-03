import {
  EventQueue,
  QueueConsumer,
  UserPayload,
} from "@eraczaptalk/zaptalk-common";
import { BaseEvent } from "@eraczaptalk/zaptalk-common";

export class AuthConsumer extends QueueConsumer<
  BaseEvent<UserPayload>,
  UserPayload
> {
  queueName: EventQueue = EventQueue.authQueue;

  async handleIncomingMessage(message: BaseEvent<UserPayload>): Promise<void> {
    console.log("Received message", message);
  }
}
