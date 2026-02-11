import { Request, Response, NextFunction } from 'express';
import { Schema, ZodError } from 'zod';
import AppError from '../utils/AppError';

const validate = (schema: Schema) => (req: Request, _res: Response, next: NextFunction) => {
    try {
        schema.parse({
            body: req.body,
            query: req.query,
            params: req.params,
        });
        next();
    } catch (error: any) {
        if (error instanceof ZodError) {
            const message = (error as any).errors.map((err: any) => err.message).join(', ');
            return next(new AppError(message, 400));
        }
        next(error);
    }
};

export default validate;
