import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger";

// Check if all required environment variables are set
Object.entries(keys).forEach(([key, value]) => {
  if (value.required && !value.value) {
    winstonLogger.error(`Missing required environment variable: ${key}`);
    throw new Error(`Missing required environment variable: ${key}`);
  } else if (value.value) {
    winstonLogger.info(`Found environment variable ${key} = ${value.value}`);
  } else {
    winstonLogger.warn(`Optional environment variable ${key} not found`);
  }
});

import {
  EventTopic,
  KafkaAdminSetup,
  RabbitMQ,
} from "@eraczaptalk/zaptalk-common";

import { AppDataSource } from "./utils/db";
import { AuthConsumer } from "./events/auth-consumer";
import { AuthEventsKafkaSingleProducer } from "./kafka/producers/auth-events-kafka-producer";
import { kafka } from "./kafka/kafka-instance";

async function start() {
  // Connect to the database using typeorm
  while (true) {
    try {
      await AppDataSource.initialize();
      winstonLogger.info("Connected to the database");
      break;
    } catch (error) {
      winstonLogger.error(
        "Failed to connect to the database, retrying in 5 seconds"
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Connect to RabbitMQ
  const { RABBITMQ_HOST, RABBITMQ_PORT } = keys;

  while (true) {
    try {
      await RabbitMQ.connect(
        `amqp://${RABBITMQ_HOST.value}:${RABBITMQ_PORT.value}`
      );
      winstonLogger.info("Connected to RabbitMQ");
      break;
    } catch (error) {
      winstonLogger.error(
        "Failed to connect to RabbitMQ, retrying in 5 seconds"
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Get the instance of RabbitMQ
  const rabbitmq = RabbitMQ.getInstance();

  // Create the consumer
  const authConsumer = new AuthConsumer(rabbitmq);
  winstonLogger.info("Created the consumer");

  // Connect the consumer to the queue
  await authConsumer.connectToQueue();
  winstonLogger.info("Connected the consumer to the queue");

  // Kafka Admin Setup
  while (true) {
    try {
      winstonLogger.info("Creating topics in Kafka");
      const kafkaAdmin = new KafkaAdminSetup(kafka);

      await kafkaAdmin.createTopics(Object.values(EventTopic));

      winstonLogger.info("Created topics in Kafka");
      break;
    } catch (error) {
      winstonLogger.error(error);
      winstonLogger.error(
        "Failed to create topics in Kafka, retrying in 5 seconds"
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Create a Kafka producer
  AuthEventsKafkaSingleProducer.create(kafka);

  while (true) {
    try {
      const producer = AuthEventsKafkaSingleProducer.getInstance();

      await producer.connectProducer();
      winstonLogger.info("Connected to the Kafka broker");
      break;
    } catch (error) {
      winstonLogger.error(error);
      winstonLogger.error(
        "Failed to connect to the Kafka broker, retrying in 5 seconds"
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  // Connect the producer to the Kafka broker

  // Start consuming messages
  authConsumer.consume();
  winstonLogger.info("Started consuming messages");
}

start();
