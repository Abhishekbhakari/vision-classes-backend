import crypto from 'crypto';
import fs from 'fs/promises';
import { v2 as cloudinary } from 'cloudinary';

import User from './user.model.js';
import Course from '../courses/course.model.js';
import AppError from '../../utils/appError.js';
import { HttpCode } from '../../constants/httpCode.js';
import sendEmail from '../../utils/sendEmail.js';
import { IUser } from './user.interface.js';

// Define types for input data
type RegisterUserInput = {
  fullName: string;
  email: string;
  password: string;
};

type LoginUserInput = {
  email: string;
  password: string;
};

type UpdateUserInput = {
  fullName?: string;
};

class UserService {
  /**
   * @description Register a new user
   */
  public async register(
    input: RegisterUserInput,
    avatarFile: Express.Multer.File | undefined
  ): Promise<{ user: IUser; token: string }> {
    const userExists = await User.findOne({ email: input.email });
    if (userExists) {
      throw new AppError('Email already exists', HttpCode.CONFLICT);
    }

    const user = await User.create({
      ...input,
      avatar: {
        public_id: input.email, // Default public_id
        secure_url:
          'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg', // Default avatar
      },
    });

    if (avatarFile) {
      try {
        const result = await cloudinary.uploader.upload(avatarFile.path, {
          folder: 'lms',
          width: 250,
          height: 250,
          gravity: 'faces',
          crop: 'fill',
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
        }
      } catch (error: any) {
        // Don't fail registration, just log the upload error
        console.error('Cloudinary upload failed:', error.message);
      } finally {
        // Remove the file from local storage
        await fs.rm(avatarFile.path);
      }
    }

    await user.save();

    const token = await user.generateJWTToken();
    user.password = undefined; // Don't return password

    return { user, token };
  }

  /**
   * @description Get courses related to the user (created by or associated)
   */
  public async getMyCourses(userId: string, userPayload: any): Promise<any[]> {
    try {
      // Flexible matching: createdBy might be stored as fullName, email or userId
      const query = {
        $or: [
          { createdBy: userPayload?.fullName },
          { createdBy: userId },
          { createdBy: userPayload?.email },
        ],
      };

      const courses = await Course.find(query);
      return courses;
    } catch (error: any) {
      throw new AppError('Failed to fetch user courses', HttpCode.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * @description Log in a user
   */
  public async login(
    input: LoginUserInput
  ): Promise<{ user: IUser; token: string }> {
    const user = await User.findOne({ email: input.email }).select('+password');

    if (!(user && (await user.comparePassword(input.password)))) {
      throw new AppError(
        'Email or Password do not match',
        HttpCode.UNAUTHORIZED
      );
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    return { user, token };
  }

  /**
   * @description Get user details by ID
   */
  public async getUserDetails(id: string): Promise<IUser> {
    const user = await User.findById(id);
    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }
    return user;
  }

  /**
   * @description Forgot password
   */
  public async forgotPassword(
    email: string,
    frontendUrl: string
  ): Promise<string> {
    const user = await User.findOne({ email });
    if (!user) {
      throw new AppError('Email not registered', HttpCode.NOT_FOUND);
    }

    const resetToken = await user.generatePasswordResetToken();
    await user.save();

    const resetPasswordUrl = `${frontendUrl}/reset-password/${resetToken}`;
    const subject = 'Reset Password';
    const message = `You can reset your password by clicking <a href=${resetPasswordUrl} target="_blank">Reset your password</a>.\nIf the above link does not work, copy-paste this link in a new tab: ${resetPasswordUrl}.\nIf you have not requested this, kindly ignore.`;

    try {
      await sendEmail(email, subject, message);
      return `Reset password token has been sent to ${email} successfully`;
    } catch (error) {
      user.forgotPasswordToken = undefined;
      user.forgotPasswordExpiry = undefined;
      await user.save();
      throw new AppError(
        'Something went wrong, please try again.',
        HttpCode.INTERNAL_SERVER_ERROR
      );
    }
  }

  /**
   * @description Reset password
   */
  public async resetPassword(
    resetToken: string,
    password: string
  ): Promise<void> {
    const forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new AppError(
        'Token is invalid or expired, please try again',
        HttpCode.BAD_REQUEST
      );
    }

    user.password = password;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();
  }

  /**
   * @description Change password
   */
  public async changePassword(
    userId: string,
    oldPass: string,
    newPass: string
  ): Promise<void> {
    const user = await User.findById(userId).select('+password');
    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    const isPasswordValid = await user.comparePassword(oldPass);
    if (!isPasswordValid) {
      throw new AppError('Invalid old password', HttpCode.BAD_REQUEST);
    }

    user.password = newPass;
    await user.save();
  }

  /**
   * @description Update user profile
   */
  public async updateUser(
    userId: string,
    input: UpdateUserInput,
    avatarFile: Express.Multer.File | undefined
  ): Promise<IUser> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', HttpCode.NOT_FOUND);
    }

    if (input.fullName) {
      user.fullName = input.fullName;
    }

    if (avatarFile) {
      // Destroy old image
      if (user.avatar.public_id) {
        await cloudinary.uploader.destroy(user.avatar.public_id);
      }

      try {
        const result = await cloudinary.uploader.upload(avatarFile.path, {
          folder: 'lms',
          width: 250,
          height: 250,
          gravity: 'faces',
          crop: 'fill',
        });

        if (result) {
          user.avatar.public_id = result.public_id;
          user.avatar.secure_url = result.secure_url;
        }
      } catch (error: any) {
        throw new AppError(
          error.message || 'File not uploaded, please try again',
          HttpCode.BAD_REQUEST
        );
      } finally {
        await fs.rm(avatarFile.path);
      }
    }

    await user.save();
    return user;
  }
}

export const userService = new UserService();