import { Request, Response, NextFunction } from "express";
import { HttpError } from "../middlewares/HttpError";
import { createProfile, updateProfile } from "../services/ProfileService";

export const createProfileHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.body;

    if (!id || typeof id !== 'number') {
      res.status(400).json({ message: "Invalid or missing user ID." });
    }

    const newProfile = await createProfile(id);

    if (newProfile) {
      res.status(201).json({message:"Profile successfully created."});
    } else {
      res.status(409).json({ message: "Profile already exists for this user." });
    }
  } catch (error) {
    console.error("[ERROR] createProfileHandler()", error);
    next(error);
  }
};

export const updateProfileHandler =  async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try{
    const {id} = req.params;
    const newData = req.body;
    const updatedProfile = await updateProfile(parseInt(id,10), newData);
    if (!updatedProfile) {
      throw new HttpError("Profile not found",404);
    }
    res.status(200).json({message:"Successfully updated."});
  }catch(error){
    console.log("[ERROR] profileUpdate");
    next(error);
  }
  return;
}