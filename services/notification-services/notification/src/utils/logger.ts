import { getWinstonLogger } from "@eraczaptalk/zaptalk-common";
import path from "path";

export const winstonLogger = getWinstonLogger(
  path.join(__dirname, "../../logs/notification.log")
);
