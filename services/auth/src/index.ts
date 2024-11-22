import { app } from "./app";

import { AppDataSource } from "./utils/db";
import { winstonLogger } from "./utils/logger.utils";

async function init() {
  try {
    while (true) {
      try {
        await AppDataSource.initialize();
        console.log("Connected to the database");

        // AppDataSource.synchronize();

        break;
      } catch (error) {
        winstonLogger.error("Failed to connect to the database");
        winstonLogger.error(error);
        winstonLogger.info("Retrying in 5 seconds");
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
