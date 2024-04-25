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
      const verifyToken = generateVerifyToken(email);

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
          verify_token: verifyToken,
          mobile_number: mobileNumber,
          active: false,
        },
      });

      await sendVerificationEmail(email, verifyToken);
      return updatedUser;
    }
  } else {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const verifyToken = generateVerifyToken(email);
    const newUser = await prisma.user.create({
      data: {
        username: existingUser.username,
        email: existingUser.email,
        first_name: firstName,
        last_name: lastName,
        middle_name: middleName,
        password: hashedPassword,
        verify_token: verifyToken,
        mobile_number: mobileNumber,
        active: false,
      },
    });

    await sendVerificationEmail(email, verifyToken);
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
  const decodedToken = decodeJWTToken(verifyToken, "verification");
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

export async function resendEmail(email: string) {
  const verifyToken = generateVerifyToken(email);
  const verifyTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { email: email },
    data: {
      verify_token: verifyToken,
    },
  });

  await sendVerificationEmail(email, verifyToken);
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

export function decodeJWTToken(token: string, expectedUsage: string) {
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

    return decoded;
  } catch (error: any) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpError(`Token has expired: ${error.message}`, 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(`JWT error: ${error.message}`, 400);
    } else {
      throw new HttpError("Error verifying token: " + error.message, 500);
    }
    console.error("[ERROR] decodeJWTToken()");
    throw error;
  }
}

export function generateAuthToken(email: string) {
  const payload = { email: email, usage: "authentication" };
  const token = generateJWTToken(payload, "24h");
  return token;
}

function generateVerifyToken(email: string) {
  const randomToken = require("crypto").randomBytes(64).toString("hex");
  const payload = {
    email: email,
    token: randomToken,
    usage: "verification",
  };
  const token = generateJWTToken(payload, "5m");
  return token;
}

async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.VERIFICATION_LINK}/${token}`;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  let info = await transporter.sendMail({
    from: '"BMaC" <is0.jimhsiao@gmail.com>',
    to: email,
    subject: "BMaC - Verify Your Email Address",
    text: `Please click on the following link to verify your email address: ${verificationLink}`,
    html: `<b>Please click on the following link to verify your email address:</b><br><a href="${verificationLink}">${verificationLink}</a>`,
  });

  console.log("Message sent: %s", info.messageId);
}
