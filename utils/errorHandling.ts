import { Request, Response, NextFunction } from 'express';
import { winstonLogger } from './winstonLogger.js';

/**
 * Global error handling middleware
 * Catches all errors and returns a formatted response
 */
export const errorHandling = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Log the error
  winstonLogger.error({
    message,
    statusCode,
    path: req.path,
    method: req.method,
    stack: err.stack,
  });

  // Send error response
  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Async error handler wrapper for route handlers
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
