import crypto from 'crypto';
import { razorpay } from '../../server.js'; // Import the configured instance
import User from '../users/user.model.js';
import Payment from './payment.model.js';
import AppError from '../../utils/appError.js';
import { HttpCode } from '../../constants/httpCode.js';
import Course from '../courses/course.model.js';

type VerifyPaymentInput = {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
};

type CreateOrderInput = {
  courseId: string;
};

type VerifyPaymentOrderInput = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
  courseId: string;
};

class PaymentService {
  /**
   * @description Get Razorpay API Key
   */
  public getRazorpayKey(): string {
    const key = process.env.RAZORPAY_KEY_ID;
    if (!key) {
      throw new AppError('Razorpay Key ID not configured', HttpCode.INTERNAL_SERVER_ERROR);
    }
    return key;
  }

  /**
   * @description Create payment order for a course (paid or free)
   */
  public async createPaymentOrder(
    courseId: string,
    userId: string
  ): Promise<any> {
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }

    // If free course, enroll user directly
    if (course.price === 0 || course.price === undefined) {
      if (!course.enrolledUsers?.includes(userId)) {
        course.enrolledUsers?.push(userId);
        await course.save();
      }
      return {
        success: true,
        isFree: true,
        message: 'Enrolled successfully',
        courseId,
      };
    }

    // For paid courses, create a Razorpay order
    const key = process.env.RAZORPAY_KEY_ID;
    const secret = process.env.RAZORPAY_SECRET;
    if (!key || !secret) {
      throw new AppError('Razorpay credentials not configured', HttpCode.INTERNAL_SERVER_ERROR);
    }

    // Create order with Razorpay
    const order = await razorpay.orders.create({
      amount: course.price * 100, // Razorpay expects amount in paise
      currency: 'INR',
      receipt: `order_${courseId}_${userId}`,
      notes: {
        courseId,
        userId,
      },
    });

    return {
      success: true,
      isFree: false,
      order_id: order.id,
      amount: order.amount,
      key,
      message: 'Order created successfully',
    };
  }

  /**
   * @description Verify payment and enroll user in course
   */
  public async verifyPayment(
    userId: string,
    input: VerifyPaymentOrderInput
  ): Promise<any> {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId } = input;
    const secret = process.env.RAZORPAY_SECRET;
    if (!secret) {
      throw new AppError('Razorpay secret not configured', HttpCode.INTERNAL_SERVER_ERROR);
    }

    // Verify signature
    const message = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(message)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new AppError('Payment verification failed', HttpCode.BAD_REQUEST);
    }

    // Payment verified, enroll user
    const course = await Course.findById(courseId);
    if (!course) {
      throw new AppError('Course not found', HttpCode.NOT_FOUND);
    }

    // Add user to enrolledUsers if not already enrolled
    if (!course.enrolledUsers?.includes(userId)) {
      course.enrolledUsers?.push(userId);
      await course.save();
    }

    // Record payment
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id: razorpay_order_id,
      razorpay_signature,
    });

    const user = await User.findById(userId);
    return user;
  }

  /**
   * @description Create a new subscription
   */
  public async buySubscription(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED);
    }
    if (user.role === 'ADMIN') {
      throw new AppError('Admin cannot purchase a subscription', HttpCode.BAD_REQUEST);
    }

    const planId = process.env.RAZORPAY_PLAN_ID;
    if (!planId) {
      throw new AppError('Razorpay Plan ID not configured', HttpCode.INTERNAL_SERVER_ERROR);
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: 12,
    });

    user.subscription.id = subscription.id;
    user.subscription.status = subscription.status;
    await user.save();

    return subscription.id;
  }

  /**
   * @description Verify subscription payment
   */
  public async verifySubscription(
    userId: string,
    input: VerifyPaymentInput
  ): Promise<void> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED);
    }

    const subscriptionId = user.subscription.id;
    const { razorpay_payment_id, razorpay_signature, razorpay_subscription_id } = input;

    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_SECRET!)
      .update(`${razorpay_payment_id}|${subscriptionId}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      throw new AppError('Payment not verified, please try again.', HttpCode.BAD_REQUEST);
    }

    // If signature is valid, create payment record
    await Payment.create({
      razorpay_payment_id,
      razorpay_subscription_id,
      razorpay_signature,
    });

    // And update user subscription status
    user.subscription.status = 'active';
    await user.save();
  }

  /**
   * @description Cancel a subscription
   */
  public async cancelSubscription(userId: string): Promise<string> {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('Unauthorized, please login', HttpCode.UNAUTHORIZED);
    }
    if (user.role === 'ADMIN') {
      throw new AppError('Admin cannot cancel a subscription', HttpCode.BAD_REQUEST);
    }

    const subscriptionId = user.subscription.id;
    if (!subscriptionId) {
      throw new AppError('No active subscription found', HttpCode.NOT_FOUND);
    }

    try {
      const subscription = await razorpay.subscriptions.cancel(subscriptionId);
      user.subscription.status = subscription.status;
    } catch (error: any) {
      // Handle Razorpay API error
      throw new AppError(error.error.description, error.statusCode);
    }

    // Find payment record for refund logic
    const payment = await Payment.findOne({
      razorpay_subscription_id: subscriptionId,
    });
    if (!payment) {
      // No payment record, but subscription is cancelled. Save user and exit.
      await user.save();
      return 'Subscription canceled, but no payment record found for refund.';
    }

    const timeSinceSubscribed = Date.now() - (payment.createdAt as any).getTime();
    const refundPeriod = 14 * 24 * 60 * 60 * 1000; // 14 days

    if (refundPeriod > timeSinceSubscribed) {
      await razorpay.payments.refund(payment.razorpay_payment_id, {
        speed: 'optimum',
      });

      user.subscription.id = undefined;
      user.subscription.status = undefined;
      await user.save();
      await Payment.deleteOne({ _id: payment._id }); // Use deleteOne

      return 'Subscription canceled successfully. Full refund initiated.';
    }

    // Refund period is over
    user.subscription.id = undefined;
    user.subscription.status = undefined;
    await user.save();

    return 'Subscription canceled successfully. Refund period has expired.';
  }

  /**
   * @description Get all payment statistics (ADMIN)
   */
  public async getAllPaymentsStats(count: number = 10, skip: number = 0) {
    const allPayments = await razorpay.subscriptions.all({ count, skip });

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 'July',
      'August', 'September', 'October', 'November', 'December',
    ];

    const finalMonths: { [key: string]: number } = {
      January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
      July: 0, August: 0, September: 0, October: 0, November: 0, December: 0,
    };

    const monthlyWisePayments = allPayments.items.map((payment) => {
      const monthsInNumbers = new Date(payment.start_at * 1000).getMonth();
      return monthNames[monthsInNumbers];
    });

    monthlyWisePayments.forEach((month) => {
      finalMonths[month]++;
    });

    const monthlySalesRecord = Object.values(finalMonths);

    return { allPayments, finalMonths, monthlySalesRecord };
  }
}

export const paymentService = new PaymentService();