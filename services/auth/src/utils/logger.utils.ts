import {
  getMorganLogger,
  getRequestErrorLogger,
  getRequestIncomingLogger,
  getWinstonLogger,
} from "@eraczaptalk/zaptalk-common";
import path from "path";

export const winstonLogger = getWinstonLogger(
  path.join(__dirname, "../../logs/auth.log")
);

export const morganRequestLogger = getMorganLogger(winstonLogger);

export const requestIncomingLogger = getRequestIncomingLogger(winstonLogger);
export const requestErrorLogger = getRequestErrorLogger(winstonLogger);
