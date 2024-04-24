import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HttpError } from "../middlewares/HttpError";
import {
  signUp,
  login,
  verifyEmail,
  resendEmail,
  generateAuthToken,
} from "../services/AuthService";

const prisma = new PrismaClient();

export const signUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, firstName, lastName, middleName, password } =
      req.body;
    const user = await signUp(
      email,
      username,
      firstName,
      lastName,
      middleName,
      password
    );

    if (user) {
      res.status(201).json({
        message:
          "Signup successful, please check your email to activate your account.",
      });
    } else {
      throw new HttpError("Failed to create new user.", 500);
    }
  } catch (error) {
    console.error("[ERROR] signUpHandler()");
    throw error;
  }
};

export const loginHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    const user = await login(identifier, password);

    if (!user) {
      throw new HttpError("User not found or invalid credentials.", 401);
    }

    if (!user.active) {
      throw new HttpError(
        "Account not verified. Please check your email to activate your account.",
        403
      );

      return;
    }

    const token = generateAuthToken(user.email);
    res.status(200).json({
      message: "Logged in successfully!",
      token: token,
    });
  } catch (error) {
    console.error("[ERROR] loginHandler()");
    throw error;
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;

  try {
    const user = await verifyEmail(token);
    if (!user) {
      throw new HttpError("User not found.", 404);
    }
    res.status(200).json({
      message: "Account has been verified successfully",
      token: generateAuthToken(user.email),
    });
  } catch (error) {
    if (error instanceof Error) {
      throw new HttpError(error.message, 404);
    } else {
      throw new HttpError("Internal server error.", 500);
    }
    console.error("[ERROR] verifyEmailHandler()");
    throw error;
  }
};

export const resendEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpError("No account found with that email address.", 404);
    }

    if (user.active) {
      throw new HttpError("This account is already verified.", 400);
    }

    await resendEmail(email);

    res
      .status(200)
      .json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error("[ERROR] resendEmailHandler()");
    throw error;
  }
};
