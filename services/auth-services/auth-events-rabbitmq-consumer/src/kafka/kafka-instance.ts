import { Kafka } from "kafkajs";

import { keys } from "../utils/keys";

const { KAFKA_CLIENT_ID, KAFKA_BROKERS } = keys;

export const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID.value!,
  brokers: KAFKA_BROKERS.value!.split(","),
});
