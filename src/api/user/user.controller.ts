import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import * as userService from './user.service';
import AppError from '../../utils/AppError';
import User from '../../models/user.model';
import sendEmail from '../../utils/sendEmail';
import crypto from 'crypto';
import { completeGoal, resetDailyGoalsIfNeeded } from './goals.service';

const cookieOptions = {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
};

export const registerUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await userService.register(req.body, req.file);

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(201).json({
        success: true,
        message: 'User registered successfully',
        user,
    });
});

export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await userService.login(email, password);

    const token = await user.generateJWTToken();
    user.password = undefined;

    res.cookie('token', token, cookieOptions);

    res.status(200).json({
        success: true,
        message: 'User logged in successfully',
        user,
    });
});

export const logoutUser = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    res.cookie('token', null, {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 0,
        httpOnly: true,
    });

    res.status(200).json({
        success: true,
        message: 'User logged out successfully',
    });
});

export const getLoggedInUserDetails = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { user, stats } = await userService.getUserWithStats(req.user!.id);

    res.status(200).json({
        success: true,
        message: 'User details',
        user,
        stats,
    });
});

export const updateUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const user = await userService.update(id, req.body, req.file);

    res.status(200).json({
        success: true,
        message: 'User details updated successfully',
        user,
    });
});

// Keeping these in controller for now as they are simple enough, or could move to service
export const forgotPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;
    if (!email) return next(new AppError('Email is required', 400));

    const user = await User.findOne({ email });
    if (!user) return next(new AppError('Email not registered', 400));

    const resetToken = await user.generatePasswordResetToken();
    await user.save();

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>\nIf the above link does not work for some reason then copy paste this link in new tab ${resetPasswordUrl}.\n If you have not requested this, kindly ignore.`;

    try {
        await sendEmail(email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password token has been sent to ${email} successfully`,
        });
    } catch (error: any) {
        user.forgotPasswordToken = undefined;
        user.forgotPasswordExpiry = undefined;
        await user.save();
        return next(new AppError(error.message || 'Something went wrong, please try again.', 500));
    }
});

export const resetPassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    const forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    if (!password) return next(new AppError('Password is required', 400));

    const user = await User.findOne({
        forgotPasswordToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) return next(new AppError('Token is invalid or expired, please try again', 400));

    user.password = password;
    user.forgotPasswordExpiry = undefined;
    user.forgotPasswordToken = undefined;
    await user.save();

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});

export const changePassword = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const { oldPassword, newPassword } = req.body;
    const { id } = req.user!;

    if (!oldPassword || !newPassword) return next(new AppError('Old password and new password are required', 400));

    const user = await User.findById(id).select('+password');
    if (!user) return next(new AppError('Invalid user id or user does not exist', 400));

    const isPasswordValid = await user.comparePassword(oldPassword);
    if (!isPasswordValid) return next(new AppError('Invalid old password', 400));

    user.password = newPassword;
    await user.save();
    user.password = undefined;

    res.status(200).json({
        success: true,
        message: 'Password changed successfully',
    });
});

export const getMyCourses = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const user = await User.findById(req.user!.id).populate('purchasedCourses');
    if (!user) return next(new AppError('User not found', 404));

    res.status(200).json({
        success: true,
        message: 'My courses fetched successfully',
        courses: user.purchasedCourses
    });
});

export const getDailyGoals = asyncHandler(async (req: Request, res: Response) => {
  const user = await resetDailyGoalsIfNeeded(req.user!.id);
  
  res.status(200).json({
    success: true,
    goals: user.dailyGoals
  });
});

export const markGoalComplete = asyncHandler(async (req: Request, res: Response) => {
  const { goalId } = req.body;
  const result = await completeGoal(req.user!.id, goalId);
  
  res.status(200).json({
    success: true,
    message: 'Goal completed!',
    xpGained: result.xpGained,
    allGoalsComplete: result.allGoalsComplete,
    goals: result.user.dailyGoals
  });
});
