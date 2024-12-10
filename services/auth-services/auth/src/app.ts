// Check for the existence of the environment variable
import "reflect-metadata";
import { keys } from "./utils/keys";
import "express-async-errors";
import {
  winstonLogger,
  morganRequestLogger,
  requestIncomingLogger,
  requestErrorLogger,
} from "./utils/logger.utils";

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

import express from "express";
import bodyParser from "body-parser";
import { errorHandler, NotFoundError } from "@eraczaptalk/zaptalk-common";
import cookieSession from "cookie-session";
import { signupRouter } from "./routes/signup";
import { healthRouter } from "./routes/health";

// Now lets define the app
const app = express();

// Enable proxy
app.set("trust proxy", true);

// Add middlewares
app.use(
  cookieSession({
    signed: false,
    secure: true,
    name: "zaptalk-session",
  })
);
app.use(morganRequestLogger);
app.use(requestIncomingLogger);
app.use(bodyParser.json());

// Add Routes
app.use(healthRouter);
app.use(signupRouter);

// not found handler
app.use((req, res) => {
  throw new NotFoundError();
});

app.use(requestErrorLogger);

app.use(errorHandler);

export { app };
