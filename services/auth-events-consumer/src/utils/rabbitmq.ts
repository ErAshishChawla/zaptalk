import ampq, { Connection } from "amqplib";

export class RabbitMQ {
  static instance: Connection | null = null;

  private constructor() {}

  static getInstance() {
    if (!RabbitMQ.instance) {
      throw new Error("RabbitMQ connection not initialized");
    }

    return RabbitMQ.instance;
  }

  static async connect(url: string) {
    if (!RabbitMQ.instance) {
      const connection = await ampq.connect(url);
      RabbitMQ.instance = connection;
      return RabbitMQ.instance;
    }

    throw new Error("RabbitMQ connection already initialized");
  }

  static async disconnect() {
    if (RabbitMQ.instance) {
      await RabbitMQ.instance.close();
      RabbitMQ.instance = null;
    }

    throw new Error("No RabbitMQ connection to close");
  }
}
