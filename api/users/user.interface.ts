import { Document, Model } from 'mongoose';
import { JwtPayload } from 'jsonwebtoken';

// Interface for the User document
export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string; // Optional because it's selected false
  subscription: {
    id: string;
    status: string;
  };
  avatar: {
    public_id: string;
    secure_url: string;
  };
  role: 'USER' | 'ADMIN';
  forgotPasswordToken?: string;
  forgotPasswordExpiry?: Date;
  comparePassword(password: string): Promise<boolean>;
  generateJWTToken(): Promise<string>;
  generatePasswordResetToken(): Promise<string>;
}

// Interface for the User model (for static methods, if any)
export interface IUserModel extends Model<IUser> {
  // Define static methods here if you add any
}