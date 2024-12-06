import {
  AuthServiceEvent,
  KafkaSingleProducer,
} from "@eraczaptalk/zaptalk-common";
import { Kafka, Producer } from "kafkajs";

import { kafka } from "../kafka-instance";

class AuthEventsKafkaSingleProducer extends KafkaSingleProducer<AuthServiceEvent> {
  constructor(kafka: Kafka) {
    super(kafka);
  }
}

export const authEventsKafkaSingleProducer = new AuthEventsKafkaSingleProducer(
  kafka
);
