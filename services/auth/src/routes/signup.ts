import { Request, Router, Response } from "express";
import {
  apiResponse,
  BadRequestError,
  EventSubject,
  RequestValidationError,
  SignupSchema,
} from "@eraczaptalk/zaptalk-common";

import { User } from "../models/user";
import { Outbox } from "../models/outbox";

import { routeMap } from "../utils/routeMap";
import { AppDataSource } from "../utils/db";

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

      // Create an outbox event
      const outboxEvent = Outbox.build({
        subject: EventSubject.USER_SIGNUP,
        payload: newUser.toJSON(),
      });

      // Save the outbox event
      await transactionalEntityManager.save(outboxEvent);
    }
  );

  return res
    .status(201)
    .send(apiResponse({ statusCode: 201, data: newUser.toJSON() }));
});

export { router as signupRouter };
