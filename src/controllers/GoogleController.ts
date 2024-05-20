import { Request, Response, NextFunction } from 'express';
import { getGoogleAuthUrl, getGoogleUser } from '../services/GoogleService';
import {generateAuthToken} from "../services/AuthService"
import { HttpError } from '../middlewares/HttpError';

export async function redirectToGoogle(req: Request, res: Response) {
    try {
        const url = await getGoogleAuthUrl();
        res.redirect(url);
    } catch (error) {
        console.error('Failed to redirect to Google:', error);
        res.status(500).json({ message: 'Failed to redirect to Google', error: error.toString() });
    }
}

export async function handleGoogleCallback(req: Request, res: Response, next: NextFunction) {
    try {
      const userinfo = await getGoogleUser(req.query.code as string);
      const token = generateAuthToken(userinfo.email);
      res.status(200).json({
        message: "Logged in successfully!",
        token: token,
      });
    } catch (error) {
      console.error('Authentication failed:', error);
      next(new HttpError('Authentication failed', 500));
    }
}
