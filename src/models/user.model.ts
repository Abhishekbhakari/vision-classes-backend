import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

export interface IUser extends Document {
    fullName: string;
    email: string;
    password?: string;
    purchasedCourses: Types.ObjectId[];
    courseProgress: {
        courseId: Types.ObjectId;
        completedLectures: Types.ObjectId[];
    }[];
    avatar: {
        public_id: string;
        secure_url: string;
    };
    role: 'USER' | 'ADMIN';
    forgotPasswordToken?: string;
    forgotPasswordExpiry?: Date;
    xp: number;
    level: number;
    streak: {
        current: number;
        lastLogin?: Date;
    };
    badges: {
        id: string;
        name: string;
        icon: string;
        earnedAt: Date;
    }[];
    dailyGoals: {
        id: string;
        text: string;
        isCompleted: boolean;
        xpReward: number;
        createdAt: Date;
    }[];
    comparePassword(plainPassword: string): Promise<boolean>;
    generateJWTToken(): Promise<string>;
    generatePasswordResetToken(): Promise<string>;
}

const userSchema = new Schema<IUser>(
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
        purchasedCourses: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Course',
            },
        ],
        courseProgress: [
            {
                courseId: {
                    type: Schema.Types.ObjectId,
                    ref: 'Course',
                },
                completedLectures: [
                    {
                        type: Schema.Types.ObjectId,
                        ref: 'Course.lectures',
                    },
                ],
            },
        ],
        avatar: {
            public_id: {
                type: String,
            },
            secure_url: {
                type: String,
            },
        },
        role: {
            type: String,
            enum: ['USER', 'ADMIN'],
            default: 'USER',
        },
        forgotPasswordToken: String,
        forgotPasswordExpiry: Date,
        xp: {
            type: Number,
            default: 0,
        },
        level: {
            type: Number,
            default: 1,
        },
        streak: {
            current: { type: Number, default: 0 },
            lastLogin: { type: Date },
        },
        badges: [
            {
                id: String,
                name: String,
                icon: String,
                earnedAt: { type: Date, default: Date.now },
            },
        ],
        dailyGoals: [
            {
                id: String,
                text: String,
                isCompleted: { type: Boolean, default: false },
                xpReward: Number,
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    {
        timestamps: true,
    }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password!, 10);
});

userSchema.methods.comparePassword = async function (plainPassword: string) {
    return await bcrypt.compare(plainPassword, this.password!);
};

userSchema.methods.generateJWTToken = async function () {
    return jwt.sign(
        {
            id: this._id,
            role: this.role,
            purchasedCourses: this.purchasedCourses,
        },
        process.env.JWT_SECRET || 'secret',
        {
            expiresIn: (process.env.JWT_EXPIRY || '7d') as any,
        }
    );
};

userSchema.methods.generatePasswordResetToken = async function () {
    const resetToken = crypto.randomBytes(20).toString('hex');
    this.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.forgotPasswordExpiry = new Date(Date.now() + 15 * 60 * 1000);
    return resetToken;
};

const User = model<IUser>('User', userSchema);

export default User;
