import { Request, Response, NextFunction } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HttpErrorMiddleware } from "../middlewares/HttpErrorMiddleware";
import {
  signUp,
  login,
  verifyEmail,
  sendVerifyEmail,
  resetPassword,
  sendResetPasswordEmail,
} from "../services/AuthService";
import { createProfile } from "../services/ProfileService";

const prisma = new PrismaClient();

export const signUpHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      email,
      username,
      first_name,
      last_name,
      middle_name,
      mobile_number,
      password,
    } = req.body;

    const user = await signUp(
      email,
      username,
      first_name,
      last_name,
      middle_name,
      mobile_number,
      password
    );

    if (user) {
      res.status(201).json({
        message:
          "Signup successful, please check your email to activate your account.",
      });
    } else {
      throw new HttpErrorMiddleware("Failed to create new user.", 500);
    }
  } catch (error) {
    console.error("[ERROR] signUpHandler()", error);
    next(error);
  }
};

export const loginHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { identifier, password } = req.body;

  try {
    const authToken = await login(identifier, password);
    res.status(200).json({
      message: "Logged in successfully!",
      token: authToken,
    });
  } catch (error) {
    console.error("[ERROR] loginHandler()");
    next(error);
  }
};

export const verifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { token } = req.params;

  try {
    const authToken = await verifyEmail(token);
    res.status(200).json({
      message: "Account has been verified successfully.",
      token: authToken,
    });
  } catch (error) {
    console.error("[ERROR] verifyEmailHandler()", error);
    next(error);
  }
};

export const sendVerifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    await sendVerifyEmail(email);

    res.status(200).json({
      message: "Verification email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("[ERROR] sendVerifyEmailHandler()", error);
    next(error);
  }
};

export const resetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  const { password } = req.body;

  if (!password) {
    throw new HttpErrorMiddleware("Password is required.", 400);
  }

  try {
    const user = await resetPassword(token, password);

    if (!user) {
      throw new HttpErrorMiddleware("Invalid or expired reset token.", 404);
    }

    res.status(200).json({ message: "Password reset successfully." });
  } catch (error) {
    console.error("[ERROR] resetPasswordHandler()");
    next(error);
  }
};

export const sendResetPasswordHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email } = req.body;

    await sendResetPasswordEmail(email);

    res.status(200).json({
      message:
        "Reset Password email sent successfully. Please check your email.",
    });
  } catch (error) {
    console.error("[ERROR] sendResetPasswordHandler()", error);
    next(error);
  }
};
