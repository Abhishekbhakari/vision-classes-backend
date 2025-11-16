import { Request, Response, NextFunction } from 'express';
import { HttpCode } from '../../constants/httpCode.js';
import AppError from '../../utils/appError.js';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { jwtUtil } from '../../utils/jwtUtil.js';

// Define a type for the decoded user payload
interface UserPayload {
  id: string;
  role: 'USER' | 'ADMIN';
  subscription: {
    id: string;
    status: string;
  };
}

// Extend the Express Request type to include our user property
declare global {
  namespace Express {
    interface Request {
      user?: UserPayload;
    }
  }
}

/**
 * @middleware isLoggedIn
 * @description Checks if user is logged in by verifying JWT token from cookies.
 */
export const isLoggedIn = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    const { token } = req.cookies;

    if (!token) {
      return next(
        new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED)
      );
    }

    // Verify token using the new jwtUtil
    const decoded = jwtUtil.verify(token) as UserPayload;

    if (!decoded) {
      return next(
        new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED)
      );
    }

    // Attach user payload to request object
    req.user = decoded;
    next();
  }
);

/**
 * @middleware authorizeRoles
 * @description Checks if the logged-in user has one of the specified roles.
 */
export const authorizeRoles = (...roles: Array<'USER' | 'ADMIN'>) =>
  asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new AppError(
          'You do not have permission to view this route',
          HttpCode.FORBIDDEN
        )
      );
    }
    next();
  });

/**
 * @middleware authorizeSubscribers
 * @description Checks if user is an ADMIN or has an active subscription.
 */
export const authorizeSubscribers = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED)
      );
    }

    if (
      req.user.role !== 'ADMIN' &&
      req.user.subscription.status !== 'active'
    ) {
      return next(
        new AppError('Please subscribe to access this route.', HttpCode.FORBIDDEN)
      );
    }
    next();
  }
);