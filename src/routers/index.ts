// routes/index.ts
import express from "express";
import authRouter from "./AuthRouter";
import userRouter from "./UserRouter";
import profileRouter from "./ProfileRouter";
import googleRouter from "./GoogleRouter";
import { jwtMiddleware } from "../middlewares/JWTMiddleware";

const router = express.Router();

router.use("/auth", authRouter);

router.use("/user", jwtMiddleware, userRouter);

router.use("/profile", jwtMiddleware, profileRouter);

router.use("/google", googleRouter);

export default router;
