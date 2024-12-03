import { RabbitMQ } from "@eraczaptalk/zaptalk-common";
import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger";

import { AuthConsumer } from "./events/auth-consumer";

async function start() {
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

  // Connect to RabbitMQ
  const { RABBITMQ_HOST, RABBITMQ_PORT } = keys;

  while (true) {
    try {
      // const rabbitmq = new RabbitMQ(
      //   `amqp://${RABBITMQ_HOST.value}:${RABBITMQ_PORT.value}`
      // );
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

  // Start consuming messages
  authConsumer.consume();
  winstonLogger.info("Started consuming messages");
}

start();
