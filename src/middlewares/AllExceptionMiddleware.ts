import { Request, Response, NextFunction } from 'express';

export function AllExceptionMiddleware(err: any, req: Request, res: Response, next: NextFunction) {
    const statusCode = err.statusCode || 500;

    const errorMessage = {
        error: {
            message: err.message || 'Internal Server Error',
            statusCode: statusCode,
        },
    };

    res.status(statusCode).json(errorMessage);
}
