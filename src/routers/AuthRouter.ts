import express from "express";
import {
  signUpHandler,
  loginHandler,
  verifyEmailHandler,
  sendVerifyEmailHandler,
  resetPasswordHandler,
  sendResetPasswordHandler,
} from "../controllers/AuthController";

const router = express.Router();

router.post("/login", loginHandler);
router.post("/sign-up", signUpHandler);
router.get("/verify/:token", verifyEmailHandler);
router.post("/send-verification", sendVerifyEmailHandler);
router.post("/reset-password", resetPasswordHandler);
router.post("/send-reset-password", sendResetPasswordHandler);

export default router;
