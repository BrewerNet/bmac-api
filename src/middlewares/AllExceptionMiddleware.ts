import { Request, Response, NextFunction } from "express";
import { HttpError } from "./HttpError";
export function AllExceptionMiddleware(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  console.log("====================================================");
  console.log(err);
  console.log("====================================================");

  const statusCode = err.statusCode || 500;

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: {
        message: err.message,
        statusCode: err.statusCode,
      },
    });
  } else {
    const statusCode = 500;
    res.status(statusCode).json({
      error: {
        message: err.message,
        statusCode,
      },
    });
  }
}
