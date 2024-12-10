import {
  IAuthServiceEvent,
  QueueProducer,
  EventQueue,
} from "@eraczaptalk/zaptalk-common";
import { Connection } from "amqplib";

export class AuthProducer extends QueueProducer<IAuthServiceEvent> {
  static instance: AuthProducer;
  queueName: EventQueue.authQueue = EventQueue.authQueue;

  private constructor(connection: Connection) {
    super(connection);

    Object.setPrototypeOf(this, AuthProducer.prototype);
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

  async publish(event: IAuthServiceEvent) {
    if (!this.channel) {
      throw new Error("Channel not initialized");
    }

    this.channel.sendToQueue(
      this.queueName,
      Buffer.from(JSON.stringify(event))
    );
  }
}
