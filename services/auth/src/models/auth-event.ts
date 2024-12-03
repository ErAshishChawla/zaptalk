import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  AuthEventEntity,
  BaseEvent,
  EventQueue,
  EventStatus,
  EventTopic,
  UserPayload,
} from "@eraczaptalk/zaptalk-common";

interface AuthEventCreationAttributes {
  payload: UserPayload;
  topic: EventTopic;
}

@Entity()
export class AuthEvent extends AuthEventEntity {
  static build(attrs: AuthEventCreationAttributes) {
    const authEvent = new AuthEvent();
    authEvent.payload = attrs.payload;
    authEvent.topic = attrs.topic;
    return authEvent;
  }

  toJSON(): BaseEvent<UserPayload> {
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
