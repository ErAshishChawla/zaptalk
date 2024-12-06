import {
  AuthServiceEvent,
  KafkaSingleProducer,
} from "@eraczaptalk/zaptalk-common";
import { Kafka } from "kafkajs";

export class AuthEventsKafkaSingleProducer extends KafkaSingleProducer<AuthServiceEvent> {
  static _instance: AuthEventsKafkaSingleProducer;

  private constructor(kafka: Kafka) {
    super(kafka);
  }

  static create(kafka: Kafka) {
    if (!this._instance) {
      this._instance = new AuthEventsKafkaSingleProducer(kafka);
      return;
    }

    throw new Error("Producer is already created");
  }

  static getInstance(): AuthEventsKafkaSingleProducer {
    if (!this._instance) {
      throw new Error("Producer is not created");
    }

    return this._instance;
  }
}
