import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as crypto from "crypto";
import nodemailer from "nodemailer";

const prisma = new PrismaClient();

export async function signUp(
  email: string,
  username: string,
  firstName: string,
  lastName: string,
  middleName: string | null,
  password: string
): Promise<User> {
  try {
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      if (existingUser.active) {
        throw new Error("User already registered and active.");
      } else {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const verifyToken = generateVerificationToken();
        const verifyTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

        // Update existing inactive user
        const updatedUser = await prisma.user.update({
          where: {
            id: existingUser.id,
          },
          data: {
            firstName: firstName,
            lastName: lastName,
            middleName: middleName,
            password: hashedPassword,
            verifyToken: verifyToken,
            verifyTokenExpires: verifyTokenExpires,
            active: false,
          },
        });

        await sendVerificationEmail(email, verifyToken);
        return updatedUser;
      }
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      const verifyToken = generateVerificationToken();
      const verifyTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

      // Create new user
      const newUser = await prisma.user.create({
        data: {
          email: email,
          username: username,
          firstName: firstName,
          lastName: lastName,
          middleName: middleName,
          password: hashedPassword,
          verifyToken: verifyToken,
          verifyTokenExpires: verifyTokenExpires,
          active: false,
        },
      });

      await sendVerificationEmail(email, verifyToken);
      return newUser;
    }
  } catch (error) {
    console.error("Registration error:", error);
    throw new Error("Failed to register user.");
  }
}

export async function login(
  identifier: string,
  password: string
): Promise<User | null> {
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  } catch (error) {
    console.error("Login error:", error);
    throw new Error("Login process failed.");
  }
}

export async function verifyEmail(verifyToken: string): Promise<User> {
  const user = await prisma.user.findUnique({
    where: { verifyToken: verifyToken },
  });

  if (
    !user ||
    !user.verifyTokenExpires ||
    new Date() > user.verifyTokenExpires
  ) {
    throw new Error("Verification token is invalid or has expired");
  }

  const updatedUser = await prisma.user.update({
    where: { id: user.id },
    data: {
      active: true,
      verifyToken: null,
      verifyTokenExpires: null,
    },
  });

  return updatedUser;
}

export async function resendEmail(email: string): Promise<void> {
  const verifyToken = generateVerificationToken();
  const verifyTokenExpires = new Date(Date.now() + 5 * 60 * 1000);

  await prisma.user.update({
    where: { email: email },
    data: {
      verifyToken: verifyToken,
      verifyTokenExpires: verifyTokenExpires,
    },
  });

  await sendVerificationEmail(email, verifyToken);
}

/* Utilities */
function generateVerificationToken() {
  return crypto.randomBytes(64).toString("hex");
}

async function sendVerificationEmail(email: string, token: string) {
  const verificationLink = `${process.env.VERIFICATION_LINK}/${token}`;

  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "is0.jimhsiao@gmail.com",
      pass: "tfml zcfw uojg boxr",
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
