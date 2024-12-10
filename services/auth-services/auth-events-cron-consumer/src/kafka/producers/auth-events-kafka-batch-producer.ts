import {
  IAuthServiceEvent,
  KafkaBatchProducer,
  KafkaSingleProducer,
} from "@eraczaptalk/zaptalk-common";
import { Kafka } from "kafkajs";

export class AuthEventsKafkaSingleProducer extends KafkaSingleProducer<IAuthServiceEvent> {
  static _instance: AuthEventsKafkaSingleProducer | null = null;

  private constructor(kafka: Kafka) {
    super(kafka);
  }

  static create(kafka: Kafka) {
    if (!AuthEventsKafkaSingleProducer._instance) {
      AuthEventsKafkaSingleProducer._instance =
        new AuthEventsKafkaSingleProducer(kafka);
      return;
    }
    throw new Error("Producer is already created");
  }

  static getInstance(): AuthEventsKafkaSingleProducer {
    if (!AuthEventsKafkaSingleProducer._instance) {
      throw new Error("Producer is not created");
    }
    return AuthEventsKafkaSingleProducer._instance;
  }
}
