import "reflect-metadata";
import { DataSource } from "typeorm";
import { AuthServiceEvent } from "@eraczaptalk/zaptalk-common";

import { keys } from "../keys";

const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME } = keys;

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST.value!,
  port: parseInt(DB_PORT.value!),
  username: DB_USER.value!,
  password: DB_PASSWORD.value!,
  database: DB_NAME.value!,
  entities: [AuthServiceEvent],
  synchronize: false,
});
