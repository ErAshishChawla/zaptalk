import path from "path";

import {
  getWinstonLogger,
  getMorganLogger,
  getRequestErrorLogger,
  getRequestIncomingLogger,
} from "@eraczaptalk/zaptalk-common";

export const winstonLogger = getWinstonLogger(
  path.join(__dirname, "../../logs")
);

export const morganRequestLogger = getMorganLogger(winstonLogger);

export const requestErrorLogger = getRequestErrorLogger(winstonLogger);
export const requestIncomingLogger = getRequestIncomingLogger(winstonLogger);
