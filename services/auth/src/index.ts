import { RabbitMQ } from "@eraczaptalk/zaptalk-common";

import { app } from "./app";

import { AuthProducer } from "./events/auth-producer";
import { AppDataSource } from "./utils/db";
import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger.utils";

async function init() {
  try {
    while (true) {
      try {
        await AppDataSource.initialize();
        winstonLogger.info("Connected to the database");
        break;
      } catch (error) {
        winstonLogger.error("Failed to connect to the database");
        winstonLogger.error(error);
        winstonLogger.info("Retrying in 5 seconds");
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    // Connect to RabbitMQ
    const { RABBITMQ_HOST, RABBITMQ_PORT } = keys;

    while (true) {
      try {
        const rabbitmq = await RabbitMQ.connect(
          `amqp://${RABBITMQ_HOST.value}:${RABBITMQ_PORT.value}`
        );
        winstonLogger.info("Connected to RabbitMQ");

        // Connect the producer
        await AuthProducer.connect(rabbitmq);
        winstonLogger.info("Connected the RabbitMQ Producer");
        break;
      } catch (error) {
        winstonLogger.error(
          "Failed to connect to RabbitMQ, retrying in 5 seconds"
        );
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }

    app.listen(3000, () => {
      console.log("Listening on port 3000");
    });
  } catch (error) {
    winstonLogger.error("Failed to start the server");
    winstonLogger.error(error);
    process.exit(0);
  }
}

init();
