import express from "express";
import authRouter from "./AuthRouter";
import userRouter from "./UserRouter";
import profileRouter from "./ProfileRouter";
import googleRouter from "./GoogleRouter";
import { decodeJWTToken } from "../services/AuthService";

import jwt from "jsonwebtoken";

const router = express.Router();

//Test JWT
const jwtMiddleware = async (req, res, next) => {
  const token = req.headers.authorization;

  if (!token) {
    return res.status(401).json({ message: "Authorization header missing" });
  }

  try {
    if (!token) {
      return res.status(401).json({ message: "Invalid token format" });
    }
    const decodedToken = await decodeJWTToken(token, "authentication");

    req.user = decodedToken;

    next();
  } catch (error) {
    next(error);
  }
};

//Access control -> Test the JWT based on the route
router.use("/user", jwtMiddleware, userRouter);
router.use(
  "/auth",
  (req, res, next) => {
    if (
      req.path === "/send-verification" ||
      req.path === "/reset-password" ||
      req.path === "/send-reset-password"
    ) {
      jwtMiddleware(req, res, next);
      next();
    } else {
      next();
    }
  },
  authRouter
);
router.use("/profile", profileRouter);
router.use("/google", googleRouter);

export default router;
