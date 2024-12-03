import { Request, Router, Response } from "express";
import {
  apiResponse,
  BadRequestError,
  EventTopic,
  RequestValidationError,
  SignupSchema,
  RabbitMQ,
} from "@eraczaptalk/zaptalk-common";

import { User } from "../models/user";
import { AuthServiceEvent } from "../models/auth-service-event";

import { routeMap } from "../utils/routeMap";
import { AppDataSource } from "../utils/db";
import { AuthProducer } from "../events/auth-producer";
import { winstonLogger } from "../utils/logger.utils";

const router = Router();

router.post(routeMap.signup(), async (req: Request, res: Response) => {
  const incomingEmail = req.body?.email;
  const incomingPassword = req.body?.password;

  const validationResult = await SignupSchema.safeParseAsync({
    email: incomingEmail,
    password: incomingPassword,
  });

  if (!validationResult.success) {
    throw new RequestValidationError(validationResult.error.errors);
  }
  const { email, password } = validationResult.data;

  // Get user Repostiory
  const userRepository = AppDataSource.getRepository(User);

  // Check if user is already registered
  const existingUser = await userRepository.findOneBy({
    email: incomingEmail,
  });

  // If yes, throw an error
  if (existingUser) {
    throw new BadRequestError("Invalid Email or Password");
  }

  // else create a new user.
  const newUser = User.build({
    email,
    password,
  });

  // Save the user
  await AppDataSource.manager.transaction(
    async (transactionalEntityManager) => {
      // Save the user
      await transactionalEntityManager.save(newUser);

      winstonLogger.info("User created successfully");

      const userPayload = await newUser.toJSON();

      const authEvent = AuthServiceEvent.build({
        topic: EventTopic.userCreated,
        payload: userPayload,
      });

      // Save the outbox event
      await transactionalEntityManager.save(authEvent);

      winstonLogger.info("AuthEvent created successfully");

      // Push the event to the queue
      const authProducer = AuthProducer.getInstance();
      authProducer.publish(authEvent.toJSON());
    }
  );

  const userPayload = await newUser.toJSON();

  return res.status(201).send(
    apiResponse({
      statusCode: 201,
      data: userPayload,
    })
  );
});

export { router as signupRouter };
