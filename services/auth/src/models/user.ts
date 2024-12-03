import { nanoid } from "nanoid";
import { DateTime } from "luxon";
import bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

import {
  UserPayload,
  Roles,
  FileUploadStatus,
  UserEntity,
} from "@eraczaptalk/zaptalk-common";

interface UserCreationAttributes {
  email: string;
  password: string;
}

@Entity()
export class User extends UserEntity {
  static build(attrs: UserCreationAttributes) {
    const user = new User();
    user.email = attrs.email;
    user.password = bcrypt.hashSync(attrs.password, 10);
    user.verificationToken = nanoid();
    user.verificationTokenExpiry = DateTime.now().plus({ hours: 24 }).toISO();
    return user;
  }

  async toJSON(): Promise<UserPayload> {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      role: this.role,
      isVerified: this.isVerified,
      isDeactivated: this.isDeactivated,
      isRegistrationCompleted: this.isRegistrationCompleted,
      // TODO: Convert this to s3 presigned get url
      avatar: this.avatarKey,
      profileDescription: this.profileDescription,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
    };
  }
}
