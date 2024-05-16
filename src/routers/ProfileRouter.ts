import express from "express";
import {
  createProfileHandler,
  updateProfileHandler
} from "../controllers/ProfileController"

const router = express.Router();

router.post("/createProfile",createProfileHandler);
router.post("/updateProfile/:id",updateProfileHandler);

export default router;