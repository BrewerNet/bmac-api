import { Request, Response, NextFunction } from "express";
import { getGoogleAuthUrl, getGoogleUser } from "../services/GoogleService";
import { generateJWTToken } from "../middlewares/JWTMiddleware";
import { HttpErrorMiddleware } from "../middlewares/HttpErrorMiddleware";

export async function redirectToGoogle(req: Request, res: Response) {
  try {
    const url = await getGoogleAuthUrl();
    res.redirect(url);
  } catch (error) {
    console.error("Failed to redirect to Google:", error);
    res.status(500).json({
      message: "Failed to redirect to Google",
      error: error.toString(),
    });
  }
}

export async function handleGoogleCallback(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const userinfo = await getGoogleUser(req.query.code as string);
    const authToken = generateJWTToken(userinfo.email, "authentication");
    res.status(200).json({
      message: "Logged in successfully!",
      token: authToken,
    });
  } catch (error) {
    console.error("Authentication failed:", error);
    next(new HttpErrorMiddleware("Authentication failed", 500));
  }
}
