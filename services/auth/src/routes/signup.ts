import { Request, Router, Response } from "express";
import {
  apiResponse,
  BadRequestError,
  RequestValidationError,
  SignupSchema,
} from "@eraczaptalk/zaptalk-common";

import { User } from "../models/user";

import { routeMap } from "../utils/routeMap";
import { AppDataSource } from "../utils/db";

const router = Router();

router.post(routeMap.signup(), async (req: Request, res: Response) => {
  const incomingEmail = req.body?.email;
  const incomingPassword = req.body?.password;

  console.log("incomingEmail", incomingEmail);
  console.log("incomingPassword", incomingPassword);

  const validationResult = await SignupSchema.safeParseAsync({
    email: incomingEmail,
    password: incomingPassword,
  });

  if (!validationResult.success) {
    throw new RequestValidationError(validationResult.error.errors);
  }

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

  // else create a new user
  const newUser = new User();
  newUser.email = incomingEmail;
  newUser.password = incomingPassword;

  // Save the user
  await AppDataSource.manager.transaction(
    async (transactionalEntityManager) => {
      await transactionalEntityManager.save(newUser);
    }
  );

  return res
    .status(201)
    .send(apiResponse({ statusCode: 201, data: newUser.JSON() }));
});

export { router as signupRouter };
