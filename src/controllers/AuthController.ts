import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
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
      throw new Error("Failed to create new user.");
    }
  } catch (error) {
    console.error("[SIGNUP HANDLER ERROR]");
    next(error);
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
      res
        .status(401)
        .json({ message: "User not found or invalid credentials" });
      return;
    }

    if (!user.active) {
      res.status(403).json({
        message:
          "Account not verified. Please check your email to activate your account.",
      });
      return;
    }

    const token = generateAuthToken(user.email);
    res.status(200).json({
      message: "Logged in successfully!",
      token: token,
    });
  } catch (error) {
    console.error("Login handler error:", error);
    res.status(500).json({ message: "Login process failed" });
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
      message: "Account has been verified successfully",
      token: generateAuthToken(user.email),
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
      res.status(400).json({ message: "This account is already verified." });
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
