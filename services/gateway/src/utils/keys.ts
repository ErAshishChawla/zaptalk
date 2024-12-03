import { IEnvKeys } from "@eraczaptalk/zaptalk-common";

export const keys: IEnvKeys = {
  ACCESS_TOKEN_SECRET: {
    required: true,
    value: process.env.ACCESS_TOKEN_SECRET,
  },
  REFRESH_TOKEN_SECRET: {
    required: true,
    value: process.env.REFRESH_TOKEN_SECRET,
  },
  PORT: {
    value: process.env.PORT,
  },
  NODE_ENV: {
    value: process.env.NODE_ENV,
  },
};
