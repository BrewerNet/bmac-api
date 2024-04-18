import express from "express";
import authRouter from "./AuthRouter";
import userRouter from "./UserRouter";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/user", userRouter);

export default router;
