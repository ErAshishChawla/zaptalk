import {
  BaseEvent,
  EventQueue,
  QueueProducer,
  UserPayload,
} from "@eraczaptalk/zaptalk-common";
import { Connection } from "amqplib";

export class AuthProducer extends QueueProducer<
  BaseEvent<UserPayload>,
  UserPayload
> {
  static instance: AuthProducer;
  queueName: EventQueue.authQueue = EventQueue.authQueue;

  private constructor(connection: Connection) {
    super(connection);
  }

  static async connect(connection: Connection) {
    const publisher = new AuthProducer(connection);
    await publisher.connectToQueue();

    this.instance = publisher;
    return publisher;
  }

  static getInstance() {
    if (!this.instance) {
      throw new Error("AuthProducer not initialized");
    }

    return this.instance;
  }
}
