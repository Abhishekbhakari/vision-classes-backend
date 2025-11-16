import { Request, Response, NextFunction, RequestHandler } from 'express';

// Higher-order function to wrap async route handlers
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next); // Pass errors to the global error handler
  };
};