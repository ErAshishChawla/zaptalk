import { IEnvKeys } from "@eraczaptalk/zaptalk-common";

export const keys: IEnvKeys = {
  RABBITMQ_HOST: {
    required: true,
    value: process.env.RABBITMQ_HOST,
  },
  RABBITMQ_PORT: {
    required: true,
    value: process.env.RABBITMQ_PORT,
  },
  DB_HOST: {
    value: process.env.DB_HOST,
    required: true,
  },
  DB_PORT: {
    value: process.env.DB_PORT,
    required: true,
  },
  DB_USER: {
    value: process.env.DB_USER,
    required: true,
  },
  DB_PASSWORD: {
    value: process.env.DB_PASSWORD,
    required: true,
  },
  DB_NAME: {
    value: process.env.DB_NAME,
    required: true,
  },
  KAFKA_CLIENT_ID: {
    value: process.env.KAFKA_CLIENT_ID,
    required: true,
  },
  KAFKA_BROKERS: {
    value: process.env.KAFKA_BROKERS,
    required: true,
  },
};
