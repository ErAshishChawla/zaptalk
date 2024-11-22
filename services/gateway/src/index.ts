// -------- APP INITIALIZATION --------

import { app } from "./app";

import { keys } from "./utils/keys";
import { winstonLogger } from "./utils/logger.utils";

const PORT = parseInt(keys.PORT.value!) || 3000;

async function init() {
  app.listen(PORT, () => {
    winstonLogger.info(`Server is running on port ${PORT}`);
    console.log(`Server is running on port ${PORT}`);
  });
}

init();
