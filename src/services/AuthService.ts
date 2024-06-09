import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import nodemailer from "nodemailer";
import { PrismaClient, User } from "@prisma/client";
import { HttpErrorMiddleware } from "../middlewares/HttpErrorMiddleware";
import {
  generateJWTToken,
  analyseJWTToken,
} from "../middlewares/JWTMiddleware";

const prisma = new PrismaClient();

export const signUp = async (
  email: string,
  username: string,
  firstName: string,
  lastName: string,
  middleName: string | null,
  mobileNumber: string,
  password: string
): Promise<User> => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { username: username }],
    },
  });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  if (existingUser) {
    if (existingUser.active) {
      throw new HttpErrorMiddleware("Email or username already exists.", 409);
    } else {
      const updatedUser = await prisma.user.update({
        where: {
          id: existingUser.id,
        },
        data: {
          username: existingUser.username,
          email: existingUser.email,
          first_name: firstName,
          last_name: lastName,
          middle_name: middleName,
          password: hashedPassword,
          mobile_number: mobileNumber,
          active: false,
        },
      });
      await sendVerifyEmail(email);
      return updatedUser;
    }
  } else {
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        password: hashedPassword,
        mobile_number: mobileNumber,
        active: false,
      },
    });

    await sendVerifyEmail(email);
    return newUser;
  }
};

export const login = async (
  identifier: string,
  password: string
): Promise<string> => {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });

  if (!user) {
    throw new HttpErrorMiddleware(
      "User not found or invalid credentials.",
      401
    );
  }

  if (!user.active) {
    sendVerifyEmail(user.email);
    throw new HttpErrorMiddleware(
      "Account not verified. Please check your email to activate your account.",
      403
    );
  }

  if (!(await bcrypt.compare(password, user.password))) {
    throw new HttpErrorMiddleware("Username or Password not matched.", 401);
  }

  return generateJWTToken(user.email, "authentication");
};

export const verifyEmail = async (token: string): Promise<string> => {
  const user = await analyseJWTToken(token, "verification");
  const authToken = generateJWTToken(user.email, "authentication");
  return authToken;
};

export const sendVerifyEmail = async (email: string) => {
  const token = generateJWTToken(email, "verification");

  const link = `${process.env.VERIFICATION_LINK}/${token}`;
  const content = {
    from: `"BMaC" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "BMaC - Verify Your Email Address",
    text: `Please click on the following link to verify your email address: ${link}`,
    html: `<b>Please click on the following link to verify your email address:</b><br><a href="${link}">${link}</a>`,
  };

  await sendEmail(content);
};

export async function sendResetPasswordEmail(email: string) {
  const token = generateJWTToken(email, "reset-passowrd");

  const link = `${process.env.RESET_PASSWORD_LINK}/${token}`;
  const content = {
    from: `"BMaC" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "BMaC - Reset Your Password",
    text: `Please click on the following link to reset your password: ${process.env.RESET_PASSWORD_LINK}/${token}`,
    html: `<b>Please click on the following link to reset your password:</b><br><a href="${link}">${link}</a>`,
  };

  await sendEmail(content);
}

export const resetPassword = async (
  token: string,
  password: string
): Promise<string> => {
  const user = await analyseJWTToken(token, "reset-password");
  const authToken = generateJWTToken(user.email, "reset-password");
  return authToken;
};

/* Utilities */
const sendEmail = async (content: {}) => {
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let receipt = await transporter.sendMail(content);
  console.log("Message sent: %s", receipt.messageId);
};
