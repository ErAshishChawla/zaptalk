import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger";
// Check for keys
Object.entries(keys).forEach(([key, value]) => {
  if (value.required && !value.value) {
    winstonLogger.error(
      `Environment variable ${key} is required but not provided`
    );
    throw new Error(`Environment variable ${key} is required but not provided`);
  } else if (!value.value) {
    winstonLogger.warn(`Environment variable ${key} is not provided`);
  } else {
    winstonLogger.info(
      `Environment variable ${key} is provided with value ${value.value}`
    );
  }
});

// Connect with the database

// Connect the kafka batch consumer

// start the notification service
