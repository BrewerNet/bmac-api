import express from "express";
import {
  createProfileHandler,
  updateProfileHandler,
  getProfileHandler,
} from "../controllers/ProfileController";

const router = express.Router();
router.get("/:id", getProfileHandler);
// router.post("/create-profile", createProfileHandler);
router.post("/update-profile", updateProfileHandler);

export default router;
