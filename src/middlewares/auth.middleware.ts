import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import AppError from '../utils/AppError';
import asyncHandler from '../utils/asyncHandler';
import { updateUserStreak } from '../api/user/streak.service';

interface JwtPayload {
    id: string;
    role: string;
    purchasedCourses: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload;
        }
    }
}

export const isLoggedIn = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
        return next(new AppError('Unauthorized, please login to continue', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as JwtPayload;

    if (!decoded) {
        return next(new AppError('Unauthorized, please login to continue', 401));
    }

    req.user = decoded;
    next();
});

export const authorizeRoles = (...roles: string[]) =>
    asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to view this route', 403));
        }
        next();
    });

export const authorizeSubscribers = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    const courseId = req.params.id || req.params.courseId;

    if (!courseId) {
        return next(new AppError('Course ID not found in request', 400));
    }

    if (req.user?.role !== 'ADMIN' && !req.user?.purchasedCourses.includes(courseId)) {
        return next(new AppError('Please purchase this course to access it.', 403));
    }

    next();
});

export const updateStreakMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.user?.id) {
        try {
            await updateUserStreak(req.user.id);
        } catch (error) {
            console.error('Streak update error:', error);
            // Don't block request if streak update fails
        }
    }
    next();
};