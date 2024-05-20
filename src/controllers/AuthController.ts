import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { HttpError } from "../middlewares/HttpError";
import {
  signUp,
  login,
  verifyEmail,
  sendVerifyEmail,
  resetPassword,
  sendResetPasswordEmail,
  generateAuthToken,
} from "../services/AuthService";
import {
  createProfile
} from "../services/ProfileService";

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
      password,
      mobile_number,
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
      const profile = await createProfile(user.id);
      if(profile){
        res.status(201).json({
          message:
            "Signup successful, please check your email to activate your account.",
        });
      }else{
        throw new HttpError("Failed to create new profile.",500);
      }
      
    } else {
      throw new HttpError("Failed to create new user.", 500);
    }
  } catch (error) {
    console.error("[ERROR] signUpHandler()");
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
    const user = await verifyEmail(token);
    if (!user) {
      throw new HttpError("User not found.", 404);
    }
    res.status(200).json({
      message: "Account has been verified successfully",
      token: generateAuthToken(user.email),
    });
  } catch (error) {
    console.error("[ERROR] verifyEmailHandler()");
    next(error);
  }
};

export const sendVerifyEmailHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
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

    await sendVerifyEmail(email);

    res
      .status(200)
      .json({ message: "Verification email resent successfully." });
  } catch (error) {
    console.error("[ERROR] sendVerifyEmailHandler()");
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
    throw new HttpError("Password is required.", 400);
  }

  try {
    const user = await resetPassword(token, password);

    if (!user) {
      throw new HttpError("Invalid or expired reset token.", 404);
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
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpError("No account found with that email address.", 404);
    }

    await sendResetPasswordEmail(email);

    res
      .status(200)
      .json({ message: "Reset password email sent successfully." });
  } catch (error) {
    console.error("[ERROR] sendResetPasswordHandler()");
    next(error);
  }
};
