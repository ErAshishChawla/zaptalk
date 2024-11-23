import { Roles, FileUploadStatus } from "@eraczaptalk/zaptalk-common";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";
import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import bcrypt from "bcryptjs";

interface UserCreationAttributes {
  email: string;
  password: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({ nullable: true, default: null })
  firstName?: string;

  @Column({ nullable: true, default: null })
  lastName?: string;

  @Column("enum", { enum: Roles, default: Roles.USER })
  role: Roles;

  @Column("text", { nullable: true, default: null })
  verificationToken?: string;

  @Column("text", { nullable: true, default: null })
  verificationTokenExpiry?: string;

  @Column("text", { nullable: true, default: null })
  resetPasswordToken?: string;

  @Column("text", { nullable: true, default: null })
  resetPasswordTokenExpiry?: string;

  @Column("boolean", { default: false })
  isVerified: boolean;

  @Column("boolean", { default: false })
  isDeactivated: boolean;

  @Column("boolean", { default: false })
  isRegistrationCompleted: boolean;

  @Column({ nullable: true, default: null })
  avatarKey?: string;

  @Column("enum", { enum: FileUploadStatus, nullable: true, default: null })
  avatarUploadStatus?: FileUploadStatus;

  @Column("text", { default: "Hey there I''m using Zaptalk!" })
  profileDescription: string;

  @Column("int", { default: 0 })
  version: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  static build(attrs: UserCreationAttributes) {
    const user = new User();
    user.email = attrs.email;
    user.password = bcrypt.hashSync(attrs.password, 10);
    user.verificationToken = nanoid();
    user.verificationTokenExpiry = DateTime.now().plus({ hours: 24 }).toISO();
    return user;
  }

  toJSON() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isVerified: this.isVerified,
      isDeactivated: this.isDeactivated,
      isRegistrationCompleted: this.isRegistrationCompleted,
      avatarKey: this.avatarKey,
      avatarUploadStatus: this.avatarUploadStatus,
      profileDescription: this.profileDescription,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}
