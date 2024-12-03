import { EnvKeys } from "@eraczaptalk/zaptalk-common";

export const keys: EnvKeys = {
  ACCESS_TOKEN_SECRET: {
    value: process.env.ACCESS_TOKEN_SECRET,
    required: true,
  },
  REFRESH_TOKEN_SECRET: {
    value: process.env.REFRESH_TOKEN_SECRET,
    required: true,
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
  RABBITMQ_HOST: {
    value: process.env.RABBITMQ_HOST,
    required: true,
  },
  RABBITMQ_PORT: {
    value: process.env.RABBITMQ_PORT,
    required: true,
  },
  PORT: {
    value: process.env.PORT,
  },
  NODE_ENV: {
    value: process.env.NODE_ENV,
  },
};
