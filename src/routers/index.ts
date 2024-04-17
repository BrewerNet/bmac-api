// userRouter.ts

import express from "express";
import {
  createUserHandler,
  getAllUsersHandler,
  getUserByIdHandler,
  updateUserHandler,
  deleteUserHandler,
} from "../controllers/UserController";
import { registerHandler, loginHandler } from "../controllers/AuthController";
const router = express.Router();

// AUTH
router.post("/login", loginHandler);
router.post("/register", registerHandler);

// USER
router.post("/users", createUserHandler);
router.get("/users", getAllUsersHandler);
router.get("/users/:id", getUserByIdHandler);
router.put("/users/:id", updateUserHandler);
router.delete("/users/:id", deleteUserHandler);

export default router;
