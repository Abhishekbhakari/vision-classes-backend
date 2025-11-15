// import crypto from 'crypto';

// import asyncHandler from '../middlewares/asyncHandler.middleware.js';
// import User from '../models/user.model.js';
// import AppError from '../utils/AppError.js';
// import { razorpay } from '../server.js';
// import Payment from '../models/Payment.model.js';

// /**
//  * @ACTIVATE_SUBSCRIPTION
//  * @ROUTE @POST {{URL}}/api/v1/payments/subscribe
//  * @ACCESS Private (Logged in user only)
//  */
// export const buySubscription = asyncHandler(async (req, res, next) => {
//   // Extracting ID from request obj
//   const { id } = req.user;

//   // Finding the user based on the ID
//   const user = await User.findById(id);

//   if (!user) {
//     return next(new AppError('Unauthorized, please login'));
//   }

//   // Checking the user role
//   if (user.role === 'ADMIN') {
//     return next(new AppError('Admin cannot purchase a subscription', 400));
//   }

//   // Creating a subscription using razorpay that we imported from the server
//   const subscription = await razorpay.subscriptions.create({
//     plan_id: process.env.RAZORPAY_PLAN_ID, // The unique plan ID
//     customer_notify: 1, // 1 means razorpay will handle notifying the customer, 0 means we will not notify the customer
//     total_count: 12, // 12 means it will charge every month for a 1-year sub.
//   });

//   // Adding the ID and the status to the user account
//   user.subscription.id = subscription.id;
//   user.subscription.status = subscription.status;

//   // Saving the user object
//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: 'subscribed successfully',
//     subscription_id: subscription.id,
//   });
// });

// /**
//  * @VERIFY_SUBSCRIPTION
//  * @ROUTE @POST {{URL}}/api/v1/payments/verify
//  * @ACCESS Private (Logged in user only)
//  */
// export const verifySubscription = asyncHandler(async (req, res, next) => {
//   const { id } = req.user;
//   const { razorpay_payment_id, razorpay_subscription_id, razorpay_signature } =
//     req.body;

//   // Finding the user
//   const user = await User.findById(id);

//   // Getting the subscription ID from the user object
//   const subscriptionId = user.subscription.id;

//   // Generating a signature with SHA256 for verification purposes
//   // Here the subscriptionId should be the one which we saved in the DB
//   // razorpay_payment_id is from the frontend and there should be a '|' character between this and subscriptionId
//   // At the end convert it to Hex value
//   const generatedSignature = crypto
//     .createHmac('sha256', process.env.RAZORPAY_SECRET)
//     .update(`${razorpay_payment_id}|${subscriptionId}`)
//     .digest('hex');

//   // Check if generated signature and signature received from the frontend is the same or not
//   if (generatedSignature !== razorpay_signature) {
//     return next(new AppError('Payment not verified, please try again.', 400));
//   }

//   // If they match create payment and store it in the DB
//   await Payment.create({
//     razorpay_payment_id,
//     razorpay_subscription_id,
//     razorpay_signature,
//   });

//   // Update the user subscription status to active (This will be created before this)
//   user.subscription.status = 'active';

//   // Save the user in the DB with any changes
//   await user.save();

//   res.status(200).json({
//     success: true,
//     message: 'Payment verified successfully',
//   });
// });

// /**
//  * @CANCEL_SUBSCRIPTION
//  * @ROUTE @POST {{URL}}/api/v1/payments/unsubscribe
//  * @ACCESS Private (Logged in user only)
//  */
// export const cancelSubscription = asyncHandler(async (req, res, next) => {
//   const { id } = req.user;

//   // Finding the user
//   const user = await User.findById(id);

//   // Checking the user role
//   if (user.role === 'ADMIN') {
//     return next(
//       new AppError('Admin does not need to cannot cancel subscription', 400)
//     );
//   }

//   // Finding subscription ID from subscription
//   const subscriptionId = user.subscription.id;

//   // Creating a subscription using razorpay that we imported from the server
//   try {
//     const subscription = await razorpay.subscriptions.cancel(
//       subscriptionId // subscription id
//     );

//     // Adding the subscription status to the user account
//     user.subscription.status = subscription.status;

//     // Saving the user object
//     await user.save();
//   } catch (error) {
//     // Returning error if any, and this error is from razorpay so we have statusCode and message built in
//     return next(new AppError(error.error.description, error.statusCode));
//   }

//   // Finding the payment using the subscription ID
//   const payment = await Payment.findOne({
//     razorpay_subscription_id: subscriptionId,
//   });

//   // Getting the time from the date of successful payment (in milliseconds)
//   const timeSinceSubscribed = Date.now() - payment.createdAt;

//   // refund period which in our case is 14 days
//   const refundPeriod = 14 * 24 * 60 * 60 * 1000;

//   // Check if refund period has expired or not
//   if (refundPeriod <= timeSinceSubscribed) {
//     return next(
//       new AppError(
//         'Refund period is over, so there will not be any refunds provided.',
//         400
//       )
//     );
//   }

//   // If refund period is valid then refund the full amount that the user has paid
//   await razorpay.payments.refund(payment.razorpay_payment_id, {
//     speed: 'optimum', // This is required
//   });

//   user.subscription.id = undefined; // Remove the subscription ID from user DB
//   user.subscription.status = undefined; // Change the subscription Status in user DB

//   await user.save();
//   await payment.remove();

//   // Send the response
//   res.status(200).json({
//     success: true,
//     message: 'Subscription canceled successfully',
//   });
// });

// /**
//  * @GET_RAZORPAY_ID
//  * @ROUTE @POST {{URL}}/api/v1/payments/razorpay-key
//  * @ACCESS Public
//  */
// export const getRazorpayApiKey = asyncHandler(async (_req, res, _next) => {
//   res.status(200).json({
//     success: true,
//     message: 'Razorpay API key',
//     key: process.env.RAZORPAY_KEY_ID,
//   });
// });

// /**
//  * @GET_RAZORPAY_ID
//  * @ROUTE @GET {{URL}}/api/v1/payments
//  * @ACCESS Private (ADMIN only)
//  */
// export const allPayments = asyncHandler(async (req, res, _next) => {
//   const { count, skip } = req.query;

//   // Find all subscriptions from razorpay
//   const allPayments = await razorpay.subscriptions.all({
//     count: count ? count : 10, // If count is sent then use that else default to 10
//     skip: skip ? skip : 0, // // If skip is sent then use that else default to 0
//   });

//   const monthNames = [
//     'January',
//     'February',
//     'March',
//     'April',
//     'May',
//     'June',
//     'July',
//     'August',
//     'September',
//     'October',
//     'November',
//     'December',
//   ];

//   const finalMonths = {
//     January: 0,
//     February: 0,
//     March: 0,
//     April: 0,
//     May: 0,
//     June: 0,
//     July: 0,
//     August: 0,
//     September: 0,
//     October: 0,
//     November: 0,
//     December: 0,
//   };

//   const monthlyWisePayments = allPayments.items.map((payment) => {
//     // We are using payment.start_at which is in unix time, so we are converting it to Human readable format using Date()
//     const monthsInNumbers = new Date(payment.start_at * 1000);

//     return monthNames[monthsInNumbers.getMonth()];
//   });

//   monthlyWisePayments.map((month) => {
//     Object.keys(finalMonths).forEach((objMonth) => {
//       if (month === objMonth) {
//         finalMonths[month] += 1;
//       }
//     });
//   });

//   const monthlySalesRecord = [];

//   Object.keys(finalMonths).forEach((monthName) => {
//     monthlySalesRecord.push(finalMonths[monthName]);
//   });

//   res.status(200).json({
//     success: true,
//     message: 'All payments',
//     allPayments,
//     finalMonths,
//     monthlySalesRecord,
//   });
// });
import crypto from 'crypto';
import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js';
import AppError from '../utils/AppError.js';
import { razorpay } from '../server.js';
import Payment from '../models/Payment.model.js';

// Helper function to enroll user and generate token
const enrollUserAndSendToken = async (user, courseId, res) => {
  // Add course to user's purchased courses
  if (!user.purchasedCourses.includes(courseId)) {
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
  const { id: userId } = req.user;
  const { courseId } = req.body;

  if (!courseId) {
    return next(new AppError('Course ID is required', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  const user = await User.findById(userId);
  if (user.purchasedCourses.includes(courseId)) {
    return next(new AppError('You have already purchased this course', 400));
  }

  // --- LOGIC FOR FREE COURSES ---
  if (course.price <= 0) {
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
      isFree: true, // Send a flag to frontend
      user: await User.findById(userId), // Send updated user data
    });
  }
  // --- END LOGIC FOR FREE COURSES ---

  // --- LOGIC FOR PAID COURSES ---
  const options = {
    amount: course.price * 100, // amount in the smallest currency unit
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
  };

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
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    courseId,
  } = req.body;

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
  await enrollUserAndSendToken(user, courseId, res);

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully',
    user: await User.findById(userId), // Send updated user data
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
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const finalMonths = {
    January: 0, February: 0, March: 0, April: 0, May: 0, June: 0,
    July: 0, August: 0, September: 0, October: 0, November: 0, December: 0,
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
