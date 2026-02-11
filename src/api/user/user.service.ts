import fs from 'fs/promises';
import User, { IUser } from '../../models/user.model';
import AppError from '../../utils/AppError';
import cloudinary from '../../config/cloudinary';

export const register = async (data: Partial<IUser>, file?: Express.Multer.File) => {
    const { fullName, email, password } = data;

    if (!fullName || !email || !password) {
        throw new AppError('All fields are required', 400);
    }

    const userExists = await User.findOne({ email });

    if (userExists) {
        throw new AppError('Email already exists', 409);
    }

    const user = await User.create({
        fullName,
        email,
        password,
        avatar: {
            public_id: email,
            secure_url: 'https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg',
        },
    });

    if (!user) {
        throw new AppError('User registration failed, please try again later', 400);
    }

    if (file) {
        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill',
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                await fs.rm(`uploads/${file.filename}`);
            }
        } catch (error: any) {
            throw new AppError(error.message || 'File not uploaded, please try again', 400);
        }
    }

    await user.save();

    return user;
};

export const login = async (email: string, password: string) => {
    if (!email || !password) {
        throw new AppError('Email and Password are required', 400);
    }

    const user = await User.findOne({ email }).select('+password');

    if (!(user && (await user.comparePassword(password)))) {
        throw new AppError('Email or Password do not match or user does not exist', 401);
    }

    return user;
};

export const getById = async (id: string) => {
    const user = await User.findById(id);
    if (!user) {
        throw new AppError('User not found', 404);
    }
    return user;
};

export const update = async (id: string, data: Partial<IUser>, file?: Express.Multer.File) => {
    const user = await User.findById(id);

    if (!user) {
        throw new AppError('Invalid user id or user does not exist', 400);
    }

    if (data.fullName) {
        user.fullName = data.fullName;
    }

    if (file) {
        if (user.avatar.public_id) {
            await cloudinary.uploader.destroy(user.avatar.public_id);
        }

        try {
            const result = await cloudinary.uploader.upload(file.path, {
                folder: 'lms',
                width: 250,
                height: 250,
                gravity: 'faces',
                crop: 'fill',
            });

            if (result) {
                user.avatar.public_id = result.public_id;
                user.avatar.secure_url = result.secure_url;

                await fs.rm(`uploads/${file.filename}`);
            }
        } catch (error: any) {
            throw new AppError(error.message || 'File not uploaded, please try again', 400);
        }
    }

    await user.save();
    return user;
};

export const getUserWithStats = async (id: string) => {
    const user = await User.findById(id).populate('purchasedCourses');

    if (!user) {
        throw new AppError('User not found', 404);
    }

    let totalLecturesDone = 0;
    let totalLeactures = 0;
    let completedCourses = 0;

    for (const course of user.purchasedCourses) {
        const courseLectureCount = (course as any).lectures?.length || 0;
        totalLeactures += courseLectureCount;

        // find course progress
        const progress = user.courseProgress.find((p) => p.courseId.toString() === (course as any)._id.toString())

        const completedLectureCount = progress?.completedLectures.length || 0;

        totalLecturesDone += completedLectureCount;

        if (completedLectureCount > 0 && completedLectureCount === courseLectureCount) {
            completedCourses++;
        }
    }

    const avgProgress = totalLeactures > 0 ? Math.round((totalLecturesDone / totalLeactures) * 100) : 0;

    return {
        user,
        stats: {
            completedCourses,
            lecturesDone: totalLecturesDone,
            avgProgress
        }
    }
}