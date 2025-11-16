import { CookieOptions } from 'express';

export const cookieOptions: CookieOptions = {
  // Set secure to true in production
  secure: process.env.NODE_ENV === 'production',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  httpOnly: true,
  sameSite: 'strict', // Or 'lax' if needed for cross-site requests
};

export const logoutCookieOptions: CookieOptions = {
  secure: process.env.NODE_ENV === 'production',
  maxAge: 0,
  httpOnly: true,
  sameSite: 'strict',
};