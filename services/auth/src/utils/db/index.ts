import { DataSource } from "typeorm";
import { User, AuthServiceEvent } from "@eraczaptalk/zaptalk-common";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [User, AuthServiceEvent],
  synchronize: true,
});

export { AppDataSource };
