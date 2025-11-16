import crypto from 'crypto';
import { Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser, IUserModel } from './user.interface.js';
import { jwtUtil } from '../../utils/jwtUtil.js';

const userSchema = new Schema<IUser, IUserModel>(
  {
    fullName: {
      type: String,
      required: [true, 'Name is required'],
      minlength: [5, 'Name must be at least 5 characters'],
      lowercase: true,
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        'Please fill in a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    subscription: {
      id: String,
      status: String,
    },
    avatar: {
      public_id: String,
      secure_url: String,
    },
    role: {
      type: String,
      enum: ['USER', 'ADMIN'],
      default: 'USER',
    },
    forgotPasswordToken: String,
    forgotPasswordExpiry: Date,
  },
  {
    timestamps: true,
  }
);

// --- Hooks ---
userSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

// --- Methods ---
userSchema.methods.comparePassword = async function (
  plainPassword: string
): Promise<boolean> {
  if (!this.password) return false;
  return await bcrypt.compare(plainPassword, this.password);
};

userSchema.methods.generateJWTToken = async function (): Promise<string> {
  const payload = {
    id: this._id,
    role: this.role,
    subscription: this.subscription,
  };
  // Use the new jwtUtil for signing
  return jwtUtil.sign(payload, process.env.JWT_SECRET || 'secret', {
    expiresIn: process.env.JWT_EXPIRY || '7d',
  });
};

userSchema.methods.generatePasswordResetToken =
  async function (): Promise<string> {
    const resetToken = crypto.randomBytes(20).toString('hex');

    this.forgotPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    this.forgotPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

    return resetToken;
  };

const User = model<IUser, IUserModel>('User', userSchema);

export default User;