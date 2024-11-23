import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import {
  OutboxEventStatus,
  EventSubject,
  OutboxEvent,
} from "@eraczaptalk/zaptalk-common";

interface OutboxCreationAttributes {
  subject: EventSubject;
  payload: Record<string, any>;
}

@Entity()
export class Outbox {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("enum", { enum: EventSubject })
  subject: EventSubject;

  @Column("jsonb")
  payload: Record<string, any>;

  @Column("enum", {
    enum: OutboxEventStatus,
    default: OutboxEventStatus.PENDING,
  })
  status: OutboxEventStatus;

  @Column({ nullable: true, default: null })
  lockedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static build(attrs: OutboxCreationAttributes): Outbox {
    const outbox = new Outbox();
    outbox.subject = attrs.subject;
    outbox.payload = attrs.payload;
    return outbox;
  }
}
