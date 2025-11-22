import crypto from 'crypto';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/appError.js';
import { razorpay } from '../server.js';
import Payment from '../models/Payment.model.js';

// Helper function to enroll user and generate token
const enrollUserAndSendToken = async (user, courseId, res) => {
  // Add course to user's purchased courses if not already purchased
  const courseIdStr = courseId.toString();
  const isCourseAlreadyPurchased = user.purchasedCourses.some(
    (id) => id.toString() === courseIdStr
  );

  if (!isCourseAlreadyPurchased) {
    user.purchasedCourses.push(courseId);
    await user.save();
  }

  // Re-generate token with new data and send it
  const token = await user.generateJWTToken();
  user.password = undefined; // Don't send password

  const cookieOptions = {
    secure: process.env.NODE_ENV === 'production' ? true : false,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    httpOnly: true,
  };
  res.cookie('token', token, cookieOptions);

  return token;
};

/**
 * @CREATE_ORDER
 * @ROUTE @POST {{URL}}/api/v1/payments/create-order
 * @ACCESS Private (Logged in user only)
 */
export const createOrder = asyncHandler(async (req, res, next) => {
  console.log('=== CREATE_ORDER DEBUG ===');
  console.log('req.user:', req.user);
  console.log('req.body:', req.body);
  
  const { id: userId } = req.user;
  const { courseId } = req.body;

  console.log('userId:', userId);
  console.log('courseId:', courseId);

  if (!courseId) {
    console.log('ERROR: courseId is missing');
    return next(new AppError('Course ID is required', 400));
  }

  console.log('Fetching course with ID:', courseId);
  const course = await Course.findById(courseId);
  console.log('course found:', !!course);
  if (!course) {
    console.log('ERROR: Course not found');
    return next(new AppError('Course not found', 404));
  }

  console.log('Fetching user with ID:', userId);
  const user = await User.findById(userId);
  console.log('user found:', !!user);
  if (!user) {
    console.log('ERROR: User not found');
    return next(new AppError('User not found', 404));
  }

  // Check if course already purchased (using proper ObjectId comparison)
  const courseIdStr = courseId.toString();
  const alreadyPurchased = user.purchasedCourses.some(
    (id) => id.toString() === courseIdStr
  );
  if (alreadyPurchased) {
    return next(new AppError('You have already purchased this course', 400));
  }

  // --- LOGIC FOR FREE COURSES ---
  if (course.price <= 0) {
    try {
      // Enroll user directly
      await enrollUserAndSendToken(user, courseId, res);

      // Create a 'success' payment record for our analytics
      await Payment.create({
        razorpay_order_id: `free_order_${courseId}_${userId}`,
        razorpay_payment_id: `free_payment_${courseId}_${userId}`,
        userId,
        courseId,
        amount: 0,
        status: 'success',
      });

      return res.status(200).json({
        success: true,
        message: 'Enrolled in free course successfully',
        isFree: true,
        user: await User.findById(userId).lean(),
      });
    } catch (error) {
      console.error('Error in free course enrollment:', error);
      return next(
        new AppError(error.message || 'Error enrolling in free course', 500)
      );
    }
  }
  // --- END LOGIC FOR FREE COURSES ---

  // --- LOGIC FOR PAID COURSES ---
  const options = {
    amount: Math.round((Number(course.price) || 0) * 100), // amount in the smallest currency unit (integer)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

  console.log('Paid course flow: course.price, typeof:', course.price, typeof course.price);
  console.log('Order options:', options);

  // Defensive check: ensure razorpay client is configured
  if (!razorpay || !razorpay.orders || typeof razorpay.orders.create !== 'function') {
    console.error('Razorpay client not available or misconfigured:', razorpay);
    return next(new AppError('Payment gateway is not configured', 500));
  }

  try {
    const order = await razorpay.orders.create(options);

    // Create a 'created' payment record in our DB
    await Payment.create({
      razorpay_order_id: order.id,
      userId,
      courseId,
      amount: course.price,
      status: 'created',
    });

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      isFree: false,
      order_id: order.id,
      amount: order.amount,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    console.error('Error creating Razorpay order or saving payment record:', error);
    return next(new AppError(error.message || 'Error creating order', 500));
  }
});

/**
 * @VERIFY_PAYMENT
 * @ROUTE @POST {{URL}}/api/v1/payments/verify-payment
 * @ACCESS Private (Logged in user only)
 */
export const verifyPayment = asyncHandler(async (req, res, next) => {
  const { id: userId } = req.user;
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature, courseId } =
    req.body;

  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature ||
    !courseId
  ) {
    return next(new AppError('Payment details are required', 400));
  }

  // Find the payment record
  const payment = await Payment.findOne({ razorpay_order_id });
  if (!payment) {
    return next(new AppError('Order not found. Invalid payment.', 400));
  }

  // Verify signature
  const generatedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (generatedSignature !== razorpay_signature) {
    payment.status = 'failed';
    await payment.save();
    return next(new AppError('Payment not verified, please try again.', 400));
  }

  // Payment is successful
  payment.razorpay_payment_id = razorpay_payment_id;
  payment.razorpay_signature = razorpay_signature;
  payment.status = 'success';
  await payment.save();

  // Enroll user and send back new token
  const user = await User.findById(userId);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  await enrollUserAndSendToken(user, courseId, res);

  // Fetch updated user with courses
  const updatedUser = await User.findById(userId)
    .select('-password')
    .lean();

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    user: updatedUser,
  });
});

/**
 * @GET_RAZORPAY_ID
 * @ROUTE @POST {{URL}}/api/v1/payments/razorpay-key
 * @ACCESS Public
 */
export const getRazorpayApiKey = asyncHandler(async (_req, res, _next) => {
  res.status(200).json({
    success: true,
    message: 'Razorpay API key',
    key: process.env.RAZORPAY_KEY_ID,
  });
});

/**
 * @GET_ALL_PAYMENTS
 * @ROUTE @GET {{URL}}/api/v1/payments
 * @ACCESS Private (ADMIN only)
 */
export const allPayments = asyncHandler(async (req, res, _next) => {
  const { count, skip } = req.query;

  // Find all successful payments from our DB
  const payments = await Payment.find({ status: 'success' })
    .populate('userId', 'fullName email')
    .populate('courseId', 'title')
    .sort({ createdAt: -1 })
    .limit(parseInt(count) || 10)
    .skip(parseInt(skip) || 0);

  const totalSuccessfulPayments = await Payment.countDocuments({
    status: 'success',
  });

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const finalMonths = {
    January: 0,
    February: 0,
    March: 0,
    April: 0,
    May: 0,
    June: 0,
    July: 0,
    August: 0,
    September: 0,
    October: 0,
    November: 0,
    December: 0,
  };

  const successfulPaymentsForStats = await Payment.find({ status: 'success' });

  const monthlyWisePayments = successfulPaymentsForStats.map((payment) => {
    const monthsInNumbers = new Date(payment.createdAt);
    return monthNames[monthsInNumbers.getMonth()];
  });

  monthlyWisePayments.forEach((month) => {
    if (finalMonths.hasOwnProperty(month)) {
      finalMonths[month] += 1;
    }
  });

  const monthlySalesRecord = Object.values(finalMonths);

  res.status(200).json({
    success: true,
    message: 'All payments',
    allPayments: payments,
    totalPaymentsCount: totalSuccessfulPayments,
    finalMonths,
    monthlySalesRecord,
  });
});
