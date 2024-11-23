import { DataSource } from "typeorm";
import { User } from "../../models/user";
import { Outbox } from "../../models/outbox";

const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST!,
  port: parseInt(process.env.DB_PORT!),
  username: process.env.DB_USER!,
  password: process.env.DB_PASSWORD!,
  database: process.env.DB_NAME!,
  entities: [User, Outbox],
  synchronize: true,
});

export { AppDataSource };
