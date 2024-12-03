import { Entity } from "typeorm";
import {
  AuthServiceEventEntity,
  EventTopic,
  IAuthServiceEvent,
  IUserPayload,
} from "@eraczaptalk/zaptalk-common";

interface AuthServiceEventCreationAttributes {
  payload: IUserPayload;
  topic: EventTopic;
}

@Entity()
export class AuthServiceEvent extends AuthServiceEventEntity {
  static build(attrs: AuthServiceEventCreationAttributes) {
    const authEvent = new AuthServiceEvent();
    authEvent.payload = attrs.payload;
    authEvent.topic = attrs.topic;
    return authEvent;
  }

  toJSON(): IAuthServiceEvent {
    return {
      id: this.id,
      queue: this.queue,
      topic: this.topic,
      payload: this.payload,
      status: this.status,
      lockedAt: this.lockedAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
