import crypto from 'crypto';
import Payment from '../../models/payment.model';
import User from '../../models/user.model';
import Course from '../../models/course.model';
import AppError from '../../utils/AppError';
import razorpay from '../../config/razorpay';
import { Response } from 'express';

const enrollUserAndSendToken = async (user: any, courseId: string, res: Response) => {
    const courseIdStr = courseId.toString();
    const isCourseAlreadyPurchased = user.purchasedCourses.some(
        (id: any) => id.toString() === courseIdStr
    );

    if (!isCourseAlreadyPurchased) {
        user.purchasedCourses.push(courseId);
        await user.save();
    }

    const token = await user.generateJWTToken();
    user.password = undefined;

    const cookieOptions = {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    };
    res.cookie('token', token, cookieOptions);

    return token;
};

export const createOrder = async (userId: string, courseId: string, res: Response) => {
    const course = await Course.findById(courseId);
    if (!course) throw new AppError('Course not found', 404);

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    const alreadyPurchased = user.purchasedCourses.some(
        (id: any) => id.toString() === courseId.toString()
    );
    if (alreadyPurchased) {
        throw new AppError('You have already purchased this course', 400);
    }

    if (course.price <= 0) {
        await enrollUserAndSendToken(user, courseId, res);
        await Payment.create({
            razorpay_order_id: `free_order_${courseId}_${userId}`,
            razorpay_payment_id: `free_payment_${courseId}_${userId}`,
            userId,
            courseId,
            amount: 0,
            status: 'success',
        });

        return {
            success: true,
            message: 'Enrolled in free course successfully',
            isFree: true,
            user,
        };
    }

    const options = {
        amount: Math.round((Number(course.price) || 0) * 100),
        currency: 'INR',
        receipt: `receipt_order_${new Date().getTime()}`,
    };

    const order = await razorpay.orders.create(options);

    await Payment.create({
        razorpay_order_id: order.id,
        userId,
        courseId,
        amount: course.price,
        status: 'created',
    });

    return {
        success: true,
        message: 'Order created successfully',
        isFree: false,
        order_id: order.id,
        amount: order.amount,
        key: process.env.RAZORPAY_KEY_ID,
    };
};

export const verifyPayment = async (userId: string, data: any, res: Response) => {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId } = data;

    const payment = await Payment.findOne({ razorpay_order_id });
    if (!payment) throw new AppError('Order not found. Invalid payment.', 400);

    const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_SECRET || '')
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest('hex');

    if (generatedSignature !== razorpay_signature) {
        payment.status = 'failed';
        await payment.save();
        throw new AppError('Payment not verified, please try again.', 400);
    }

    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = 'success';
    await payment.save();

    const user = await User.findById(userId);
    if (!user) throw new AppError('User not found', 404);

    await enrollUserAndSendToken(user, courseId, res);

    const updatedUser = await User.findById(userId).select('-password').lean();
    return updatedUser;
};

export const getAllPayments = async (count: number, skip: number) => {
    const payments = await Payment.find({ status: 'success' })
        .populate('userId', 'fullName email')
        .populate('courseId', 'title')
        .sort({ createdAt: -1 })
        .limit(count)
        .skip(skip);

    const totalSuccessfulPayments = await Payment.countDocuments({
        status: 'success',
    });

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
    ];

    const finalMonths: any = {
        January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
        July: 0, August: 0, September: 0, October: 0, November: 0, December: 0,
    };

    const successfulPaymentsForStats = await Payment.find({ status: 'success' });

    const monthlyWisePayments = successfulPaymentsForStats.map((payment) => {
        const monthsInNumbers = new Date(payment.createdAt as any);
        return monthNames[monthsInNumbers.getMonth()];
    });

    monthlyWisePayments.forEach((month) => {
        if (finalMonths.hasOwnProperty(month)) {
            finalMonths[month] += 1;
        }
    });

    const monthlySalesRecord = Object.values(finalMonths);

    return {
        allPayments: payments,
        totalPaymentsCount: totalSuccessfulPayments,
        finalMonths,
        monthlySalesRecord,
    };
};
