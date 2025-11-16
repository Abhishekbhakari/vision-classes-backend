import { z } from 'zod';

export const registerUserSchema = z.object({
  body: z.object({
    fullName: z
      .string()
      .min(5, 'Name must be at least 5 characters'),
    email: z.string().email('Please fill in a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  }),
});

export const loginUserSchema = z.object({
  body: z.object({
    email: z.string().email('Email is required'),
    password: z.string().min(1, 'Password is required'),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Email is required'),
  }),
});

export const resetPasswordSchema = z.object({
  params: z.object({
    resetToken: z.string(),
  }),
  body: z.object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters'),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    oldPassword: z.string().min(1, 'Old password is required'),
    newPassword: z
      .string()
      .min(8, 'New password must be at least 8 characters'),
  }),
});

export const updateUserSchema = z.object({
  params: z.object({
    id: z.string().length(24, 'Invalid user ID'), // Assumes Mongoose ObjectId
  }),
  body: z.object({
    fullName: z
      .string()
      .min(5, 'Name must be at least 5 characters')
      .optional(),
  }),
});