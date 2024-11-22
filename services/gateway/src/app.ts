import {
  winstonLogger,
  morganRequestLogger,
  requestErrorLogger,
  requestIncomingLogger,
} from "./utils/logger.utils";

// -------- ENV CHECKS --------
// Check for the environment variables
import { keys } from "./utils/keys";

Object.entries(keys).forEach(([key, value]) => {
  const { value: envValue, required } = value;

  if (!envValue && required) {
    winstonLogger.error(`Environment variable ${key} is not defined`);
    throw new Error(`Environment variable ${key} is not defined`);
  }

  winstonLogger.info(`Environment variable ${key} is defined`);
});

import express from "express";
import cookieSession from "cookie-session";
import "express-async-errors";
import { errorHandler, currentUser } from "@eraczaptalk/zaptalk-common";

import { setupRoutes } from "./utils/api.utils";
import { NotFoundError } from "@eraczaptalk/zaptalk-common";

import { config } from "./config/config";

const app = express();

app.set("trust proxy", true);

// Middlewares
app.use(cookieSession(config.cookieSessionOptions));
app.use(currentUser);
app.use(requestIncomingLogger);
app.use(morganRequestLogger);

// Routes
setupRoutes(app);

// Not found route
app.use(() => {
  throw new NotFoundError();
});

// Error handling middleware
app.use(requestErrorLogger);
app.use(errorHandler);

export { app };
