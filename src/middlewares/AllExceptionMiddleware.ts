import { Request, Response, NextFunction } from "express";
import { HttpErrorMiddleware } from "./HttpErrorMiddleware";
export function AllExceptionMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = err.statusCode || 500;

  if (err instanceof HttpErrorMiddleware) {
    res.status(err.statusCode).json({
      message: err.message,
    });
  } else {
    const statusCode = 500;
    res.status(statusCode).json({
      message: err.message,
    });
  }
}
