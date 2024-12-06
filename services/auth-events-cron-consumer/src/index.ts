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

import nodecron from "node-cron";
import { EventQueue, jobSchedules } from "@eraczaptalk/zaptalk-common";

import { AppDataSource } from "./utils/db";
import { consumeAuthEvents } from "./jobs/auth-events";

const jobSchedule = jobSchedules[EventQueue.authQueue];

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

  // Start the cron job
  nodecron.schedule(jobSchedule, () => {
    winstonLogger.info(`Running the cron job: ${jobSchedule}`);

    consumeAuthEvents(100);
  });
}

init();
