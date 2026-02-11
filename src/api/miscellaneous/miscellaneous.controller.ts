import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import User from '../../models/user.model';
import AppError from '../../utils/AppError';
import sendEmail from '../../utils/sendEmail';

export const contactUs = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return next(new AppError('Name, Email, Message are required', 400));
    }

    try {
        const subject = 'Contact Us Form';
        const textMessage = `${name} - ${email} <br /> ${message}`;

        await sendEmail(process.env.CONTACT_US_EMAIL || '', subject, textMessage);
    } catch (error: any) {
        return next(new AppError(error.message, 400));
    }

    res.status(200).json({
        success: true,
        message: 'Your request has been submitted successfully',
    });
});

export const userStats = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    const allUsersCount = await User.countDocuments();

    const subscribedUsersCount = await User.countDocuments({
        'purchasedCourses.0': { $exists: true }, // Check if purchasedCourses array is not empty
    });

    res.status(200).json({
        success: true,
        message: 'All registered users count',
        allUsersCount,
        subscribedUsersCount,
    });
});
