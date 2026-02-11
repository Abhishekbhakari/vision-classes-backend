import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/AppError';

const errorMiddleware = (err: any, _req: Request, res: Response, _next: NextFunction) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || 'Something went wrong';

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
};

export default errorMiddleware;
