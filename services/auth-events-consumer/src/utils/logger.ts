import path from "path";
import { getWinstonLogger } from "@eraczaptalk/zaptalk-common";

export const winstonLogger = getWinstonLogger(
  path.join(__dirname, "../../logs/auth-events-consumer.log")
);
