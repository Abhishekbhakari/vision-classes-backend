import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { winstonLogger } from './winstonLogger.js';

/**
 * Validation middleware for Zod schemas
 */
export const validate = (schema: ZodSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.body = result.body || req.body;
      req.query = result.query || req.query;
      req.params = result.params || req.params;
      next();
    } catch (error: any) {
      winstonLogger.error('Validation error:', error.errors);
      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors,
      });
    }
  };
};
