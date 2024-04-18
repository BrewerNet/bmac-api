import express from "express";
import {
  signUpHandler,
  loginHandler,
  verifyEmailHandler,
  resendEmailHandler,
} from "../controllers/AuthController";

const router = express.Router();

router.post("/login", loginHandler);
router.post("/sign-up", signUpHandler);
router.get("/verify/:token", verifyEmailHandler);
router.post("/resend-verification", resendEmailHandler);

export default router;
