import { Request, Response } from "express";
import { register, login } from "../services/UserService";

export const registerHandler = async (req, res) => {
  try {
    const response = await register(req.body);
    res.status(201).send(response);
  } catch (error) {
    res.status(500).send(error.message);
  }
};

export const loginHandler = async (req, res) => {
  try {
    const token = await login(req.body);
    res.json({ message: "Logged in!", token });
  } catch (error) {
    res.status(401).send(error.message);
  }
};
