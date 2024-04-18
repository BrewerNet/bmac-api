import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  signUp,
  login,
  verifyEmail,
  resendEmail,
} from "../services/AuthService";

const prisma = new PrismaClient();

export const signUpHandler = async (
  req: Request,
  res: Response
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

    if (user.verifyToken) {
      res.status(201).json({
        message:
          "Signup successful, please check your email to activate your account.",
      });
    } else {
      throw new Error("Failed to create verification token.");
    }
  } catch (error) {
    console.error(error);
    if (
      error instanceof Error &&
      error.message === "Email or username already exists"
    ) {
      res.status(409).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
  }
};

export const loginHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { identifier, password } = req.body;

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: identifier }, { username: identifier }] },
    });

    if (!user) {
      res.status(401).json({ message: "User not found" });
      return;
    }

    if (!user.active) {
      res.status(403).json({
        message:
          "Account not activated. Please check your email to activate your account.",
      });
      return;
    }

    if (await bcrypt.compare(password, user.password)) {
      res.status(200).json({
        message: "Logged in successfully!",
        token: generateJwtToken(user.id, user.email),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: "An unknown error occurred" });
    }
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { token } = req.params;

  try {
    const user = await verifyEmail(token);
    res.status(200).json({
      message: "Account activated successfully",
      token: generateJwtToken(user.id, user.email),
    });
  } catch (error) {
    console.error(error);
    if (error instanceof Error) {
      res.status(404).json({ message: error.message });
    } else {
      res.status(500).json({ message: "Internal server error" });
    }
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
      res
        .status(404)
        .json({ message: "No account found with that email address." });
      return;
    }

    if (user.active) {
      res.status(400).json({ message: "This account is already activated." });
      return;
    }

    await resendEmail(email);

    res
      .status(200)
      .json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/* Utilities */
function generateJwtToken(
  userId: number,
  email: string,
  expiresIn: string = "1h"
): string {
  const payload = {
    userId,
    email,
  };

  const secretKey = process.env.JWT_SECRET as string;
  if (!secretKey) {
    throw new Error("JWT_SECRET is not defined in the environment variables.");
  }

  const token = jwt.sign(payload, secretKey, {
    expiresIn: expiresIn,
  });

  return token;
}
