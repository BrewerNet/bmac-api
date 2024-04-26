import { PrismaClient, User } from "@prisma/client";
import { HttpError } from "../middlewares/HttpError";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function signUp(
  email: string,
  username: string,
  firstName: string,
  lastName: string,
  middleName: string | null,
  mobileNumber: string,
  password: string
): Promise<User> {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: email }, { username: username }],
    },
  });

  if (existingUser) {
    if (existingUser.active) {
      throw new HttpError("Email or username already exists.", 409);
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const token = generateVerifyToken(email);

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
          verify_token: token,
          mobile_number: mobileNumber,
          active: false,
        },
      });

      await sendEmail(verifyEmailContent(email, token));
      return updatedUser;
    }
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const token = generateVerifyToken(email);
    const newUser = await prisma.user.create({
      data: {
        username: username,
        email: email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        password: hashedPassword,
        verify_token: token,
        mobile_number: mobileNumber,
        active: false,
      },
    });

    await sendEmail(verifyEmailContent(email, token));
    return newUser;
  }
}

export async function login(
  identifier: string,
  password: string
): Promise<User | null> {
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ email: identifier }, { username: identifier }],
    },
  });
  if (user && (await bcrypt.compare(password, user.password))) {
    return user;
  }
  return null;
}

export async function verifyEmail(verifyToken: string) {
  const decodedToken = await decodeJWTToken(verifyToken, "verification");
  if (!decodedToken) {
    return null;
  }
  const updatedUser = await prisma.user.update({
    where: { email: decodedToken.email },
    data: {
      active: true,
      verify_token: null,
    },
  });

  return updatedUser;
}

export async function sendVerifyEmail(email: string) {
  const token = generateVerifyToken(email);

  await prisma.user.update({
    where: { email: email },
    data: {
      verify_token: token,
    },
  });

  await sendEmail(verifyEmailContent(email, token));
}

export async function sendResetPasswordEmail(email: string) {
  const token = generateResetPasswordToken(email);
  await prisma.user.update({
    where: { email: email },
    data: {
      verify_token: token,
    },
  });
  await sendEmail(resetPasswordEmailContent(email, token));
}

export async function resetPassword(verifyToken: string, password: string) {
  const decodedToken = await decodeJWTToken(verifyToken, "reset-password");
  if (!decodedToken) {
    return null;
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  const updatedUser = await prisma.user.update({
    where: { email: decodedToken.email },
    data: { password: hashedPassword, verify_token: null },
  });

  return updatedUser;
}

/* Utilities */
function generateJWTToken(payload: {}, expiresIn: string = "5m"): string {
  const secretKey = process.env.JWT_SECRET as string;
  if (!secretKey) {
    throw new HttpError(
      "JWT_SECRET is not defined in the environment variables.",
      500
    );
  }

  const token = jwt.sign(payload, secretKey, {
    expiresIn: expiresIn,
  });

  return token;
}

async function decodeJWTToken(token: string, expectedUsage: string) {
  try {
    const secretKey = process.env.JWT_SECRET as string;
    if (!secretKey) {
      throw new HttpError(
        "JWT_SECRET is not defined in the environment variables.",
        500
      );
    }

    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload;
    if (decoded.usage !== expectedUsage) {
      throw new HttpError("Token usage mismatch.", 403);
    }

    const user = await prisma.user.findUnique({
      where: { email: decoded.email },
    });

    if (!user) {
      throw new HttpError("User not found.", 404);
    }

    if (user.verify_token !== token) {
      throw new HttpError("Token does not match the user's stored token.", 401);
    }

    return decoded;
  } catch (error: any) {
    console.error("[ERROR] decodeJWTToken()");
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(`Token has expired: ${error.message}`, 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(`JWT error: ${error.message}`, 400);
    }
    throw error;
  }
}

export function generateAuthToken(email: string) {
  const payload = { email: email, usage: "authentication" };
  const token = generateJWTToken(payload, "24h");
  return token;
}

function generateResetPasswordToken(email: string) {
  const randomToken = crypto.randomBytes(16).toString("hex");
  const payload = {
    email: email,
    usage: "reset-password",
    unique: randomToken,
  };
  const token = generateJWTToken(payload, "5m");
  return token;
}

function generateVerifyToken(email: string) {
  const randomToken = crypto.randomBytes(16).toString("hex");
  const payload = { email: email, usage: "verification", unique: randomToken };
  const token = generateJWTToken(payload, "5m");
  return token;
}

async function sendEmail(content: {}) {
  let transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let receipt = await transporter.sendMail(content);
  console.log("Message sent: %s", receipt.messageId);
}

const verifyEmailContent = (email, token) => {
  const link = `${process.env.VERIFICATION_LINK}/${token}`;
  return {
    from: `"BMaC" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "BMaC - Verify Your Email Address",
    text: `Please click on the following link to verify your email address: ${link}`,
    html: `<b>Please click on the following link to verify your email address:</b><br><a href="${link}">${link}</a>`,
  };
};

const resetPasswordEmailContent = (email, token) => {
  const link = `${process.env.RESET_PASSWORD_LINK}/${token}`;
  return {
    from: `"BMaC" <${process.env.EMAIL_ADDRESS}>`,
    to: email,
    subject: "BMaC - Reset Your Password",
    text: `Please click on the following link to reset your password: ${link}`,
    html: `<b>Please click on the following link to reset your password:</b><br><a href="${link}">${link}</a>`,
  };
};
