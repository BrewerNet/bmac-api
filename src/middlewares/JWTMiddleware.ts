import jwt from "jsonwebtoken";
import { PrismaClient, User } from "@prisma/client";
import { HttpErrorMiddleware } from "./HttpErrorMiddleware";
const prisma = new PrismaClient();

export const generateJWTToken = (
  email: string,
  usage: string,
  expiresIn: string = "5m"
): string => {
  const secretKey = process.env.JWT_SECRET as string;
  if (!secretKey) {
    throw new HttpErrorMiddleware(
      "JWT_SECRET is not defined in the environment variables.",
      500
    );
  }

  const payload = {
    email: email,
    usage: usage,
  };

  const token = jwt.sign(payload, secretKey, {
    expiresIn: expiresIn,
  });

  return token;
};

export const analyseJWTToken = async (
  token: string,
  expectedUsage: string
): Promise<User> => {
  try {
    const secretKey = process.env.JWT_SECRET as string;
    if (!secretKey) {
      throw new HttpErrorMiddleware(
        "JWT_SECRET is not defined in the environment variables.",
        500
      );
    }

    token = token.split(" ")[1];

    const decodedToken = jwt.verify(token, secretKey) as jwt.JwtPayload;

    if (decodedToken.usage !== expectedUsage) {
      throw new HttpErrorMiddleware("Token usage mismatch.", 403);
    }

    const user = await prisma.user.findUnique({
      where: { email: decodedToken.email },
    });

    if (!user) {
      throw new HttpErrorMiddleware("User not found.", 404);
    }

    if (expectedUsage === "verification" && user.verify_token !== token) {
      throw new HttpErrorMiddleware(
        "Token does not match the user's stored token.",
        401
      );
    }
    return user;
  } catch (error: any) {
    console.error("[ERROR] analyseJWTToken()");
    if (error instanceof jwt.TokenExpiredError) {
      throw new HttpErrorMiddleware(`Token has expired: ${error.message}`, 401);
    } else if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpErrorMiddleware(`JWT error: ${error.message}`, 400);
    }
    throw error;
  }
};

export const jwtMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }

    req.user = await analyseJWTToken(token, "authentication");

    next();
  } catch (error) {
    next(error);
  }
};
