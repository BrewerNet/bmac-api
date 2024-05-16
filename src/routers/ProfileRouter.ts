import express from "express";
import {
  createProfileHandler,
  updateProfileHandler
} from "../controllers/ProfileController"

const router = express.Router();

router.post("/create-profile",createProfileHandler);
router.post("/update-profile/:id",updateProfileHandler);

export default router;