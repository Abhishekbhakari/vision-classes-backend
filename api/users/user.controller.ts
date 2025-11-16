import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { userService } from './user.service.js';
import { HttpCode } from '../../constants/httpCode.js';
import {
  cookieOptions,
  logoutCookieOptions,
} from '../../constants/cookieOptions.js';

class UserController {
  // --- Register ---
  public register = asyncHandler(async (req: Request, res: Response) => {
    const { fullName, email, password } = req.body;
    const avatarFile = req.file;

    const { user, token } = await userService.register(
      { fullName, email, password },
      avatarFile
    );

    res.cookie('token', token, cookieOptions);
    res.status(HttpCode.CREATED).json({
      success: true,
      message: 'User registered successfully',
      user,
    });
  });

  // --- Login ---
  public login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, token } = await userService.login({ email, password });

    res.cookie('token', token, cookieOptions);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'User logged in successfully',
      user,
    });
  });

  // --- Logout ---
  public logout = asyncHandler(async (_req: Request, res: Response) => {
    res.cookie('token', null, logoutCookieOptions);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'User logged out successfully',
    });
  });

  // --- Get Me ---
  public getLoggedInUserDetails = asyncHandler(
    async (req: Request, res: Response) => {
      // req.user.id comes from isLoggedIn middleware
      const userId = req.user!.id;
      const user = await userService.getUserDetails(userId);
      res.status(HttpCode.OK).json({
        success: true,
        message: 'User details',
        user,
      });
    }
  );

  // --- Forgot Password ---
  public forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    
    const message = await userService.forgotPassword(email, frontendUrl);

    res.status(HttpCode.OK).json({
      success: true,
      message,
    });
  });

  // --- Reset Password ---
  public resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { resetToken } = req.params;
    const { password } = req.body;

    await userService.resetPassword(resetToken, password);

    res.status(HttpCode.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  // --- Change Password ---
  public changePassword = asyncHandler(async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body;
    const userId = req.user!.id;

    await userService.changePassword(userId, oldPassword, newPassword);

    res.status(HttpCode.OK).json({
      success: true,
      message: 'Password changed successfully',
    });
  });

  // --- Update User ---
  public updateUser = asyncHandler(async (req: Request, res: Response) => {
    const { fullName } = req.body;
    const { id } = req.params;
    const avatarFile = req.file;

    await userService.updateUser(id, { fullName }, avatarFile);

    res.status(HttpCode.OK).json({
      success: true,
      message: 'User details updated successfully',
    });
  });

  // --- Get My Courses ---
  public getMyCourses = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const courses = await userService.getMyCourses(userId, req.user);

    res.status(HttpCode.OK).json({
      success: true,
      message: 'User courses fetched successfully',
      courses,
    });
  });
}

export const userController = new UserController();