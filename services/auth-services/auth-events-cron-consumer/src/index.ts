import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger";

// Check for keys
Object.entries(keys).forEach(([key, value]) => {
  if (value.required && !value.value) {
    winstonLogger.error(
      `Environment variable ${key} is required but not provided`
    );
    process.exit(1);
  } else if (!value.value) {
    winstonLogger.warn(`Environment variable ${key} is not provided`);
  } else {
    winstonLogger.info(
      `Environment variable ${key} is provided with value ${value.value}`
    );
  }
});

import nodecron, { validate } from "node-cron";
import {
  EventQueueConfig,
  EventQueue,
  KafkaAdminSetup,
  EventTopic,
} from "@eraczaptalk/zaptalk-common";

import { AppDataSource } from "./utils/db";
import { consumeAuthEvents } from "./jobs/auth-events";
import { AuthEventsKafkaSingleProducer } from "./kafka/producers/auth-events-kafka-batch-producer";
import { kafka } from "./kafka/kafka-instance";

const jobConfig = EventQueueConfig[EventQueue.authQueue];

async function init() {
  // Connect to the database
  while (true) {
    try {
      await AppDataSource.initialize();
      winstonLogger.info("Connected to the database");
      break;
    } catch (error) {
      winstonLogger.error(
        "Failed to connect to the database. Retrying in 5 seconds..."
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Create topics in Kafka
  const kafkaAdmin = new KafkaAdminSetup(kafka);

  while (true) {
    try {
      await kafkaAdmin.createTopics(Object.values(EventTopic));
      winstonLogger.info("Kafka topics created");
      break;
    } catch (error) {
      winstonLogger.error(
        "Failed to create Kafka topics. Retrying in 5 seconds..."
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }
  // Create a kafka Producer
  AuthEventsKafkaSingleProducer.create(kafka);
  // Get the instance of the kafka Producer
  const kafkaProducer = AuthEventsKafkaSingleProducer.getInstance();

  // Connect the Kafka Producer
  while (true) {
    try {
      await kafkaProducer.connectProducer();
      winstonLogger.info("Auth Events Kafka Batch Producer connected");
      break;
    } catch (error) {
      winstonLogger.error(
        "Failed to connect Auth Events Kafka Batch Producer to Kafka. Retrying in 5 seconds..."
      );
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  // Start the cron job
  nodecron.schedule(
    validate(jobConfig.jobSchedule) ? jobConfig.jobSchedule : "*/60 * * * * *",
    () => {
      winstonLogger.info(
        `Running the cron job: ${jobConfig.jobSchedule || "Every 60 seconds"}`
      );

      consumeAuthEvents(20);
    }
  );
}

init();
