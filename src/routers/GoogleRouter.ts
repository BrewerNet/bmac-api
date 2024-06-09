import express from "express";
import {
  redirectToGoogle,
  handleGoogleCallback,
} from "../controllers/GoogleController";

const router = express.Router();

router.get("/", redirectToGoogle);
router.get("/callback", handleGoogleCallback);
export default router;
