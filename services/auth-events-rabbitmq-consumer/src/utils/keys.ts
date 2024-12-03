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
};
