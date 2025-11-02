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

// abhishekbhakari/vision-classes-backend/vision-classes-backend-2abfd55e8e05597a6b97163bf590df4d98519459/controllers/payment.controller.js

import crypto from 'crypto';

import asyncHandler from '../middlewares/asyncHandler.middleware.js';
import User from '../models/user.model.js';
import Course from '../models/course.model.js'; // Import Course model
import AppError from '../utils/AppError.js';
import { razorpay } from '../server.js';
import Payment from '../models/Payment.model.js';

/**
 * @PURCHASE_COURSE
 * @ROUTE @POST {{URL}}/api/v1/payments/purchase-course
 * @ACCESS Private (Logged in user only)
 * @description Replaces buySubscription. Creates a Razorpay Order for a single course.
 */
export const purchaseCourse = asyncHandler(async (req, res, next) => {
  const { courseId } = req.body;
  const { id } = req.user;

  if (!courseId) {
    return next(new AppError('Course ID is required', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('Unauthorized, please login', 401));
  }

  if (user.role === 'ADMIN') {
    return next(new AppError('Admin cannot purchase a course', 400));
  }

  // Check if user already owns the course
  if (user.purchasedCourses.includes(courseId)) {
    return next(new AppError('You have already purchased this course', 400));
  }

  const course = await Course.findById(courseId);
  if (!course) {
    return next(new AppError('Course not found', 404));
  }

  if (course.price <= 0) {
    // If course is free, grant access directly
    user.purchasedCourses.push(courseId);
    await user.save();
    return res.status(200).json({
      success: true,
      message: 'Course is free and has been added to your courses',
    });
  }

  // Create an order with Razorpay
  const options = {
    amount: Math.round(course.price * 100), // amount in the smallest currency unit (paise)
    currency: 'INR',
    receipt: `receipt_order_${new Date().getTime()}`,
    notes: {
      courseId: courseId,
      userId: id,
      courseName: course.title,
    },
  };

  try {
    const order = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      message: 'Order created successfully',
      order,
      key: process.env.RAZORPAY_KEY_ID, // Send key to frontend
    });
  } catch (error) {
    console.log(error);
    return next(new AppError('Error creating Razorpay order', 500));
  }
});

/**
 * @VERIFY_COURSE_PAYMENT
 * @ROUTE @POST {{URL}}/api/v1/payments/verify-payment
 * @ACCESS Private (Logged in user only)
 * @description Replaces verifySubscription. Verifies a one-time payment.
 */
export const verifyCoursePayment = asyncHandler(async (req, res, next) => {
  const { id } = req.user;
  const {
    razorpay_payment_id,
    razorpay_order_id,
    razorpay_signature,
    courseId, // Send this back from frontend
  } = req.body;

  if (
    !razorpay_payment_id ||
    !razorpay_order_id ||
    !razorpay_signature ||
    !courseId
  ) {
    return next(new AppError('Payment details are required', 400));
  }

  const user = await User.findById(id);
  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Verify the signature
  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest('hex');

  // Check if generated signature and signature received from the frontend is the same
  if (expectedSignature !== razorpay_signature) {
    return next(new AppError('Payment not verified, signature mismatch.', 400));
  }

  // If they match, create payment and store it in the DB
  await Payment.create({
    razorpay_payment_id,
    razorpay_order_id, // Storing order_id instead of subscription_id
    razorpay_signature,
  });

  // Update the user's purchasedCourses array
  user.purchasedCourses.push(courseId);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Payment verified successfully, course added!',
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
 * @GET_ALL_PAYMENTS (Updated)
 * @ROUTE @GET {{URL}}/api/v1/payments
 * @ACCESS Private (ADMIN only)
 * @description Fetches all payments from your local DB.
 */
export const allPayments = asyncHandler(async (req, res, _next) => {
  const { count = 10, skip = 0 } = req.query;

  // Find all payments from local DB
  const allPayments = await Payment.find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(count);

  // Note: The logic for monthlySalesRecord below was based on subscription.start_at
  // This needs to be changed to use payment.createdAt from your local DB
  // This example focuses on just returning the payments.

  const paymentsCount = await Payment.countDocuments();

  res.status(200).json({
    success: true,
    message: 'All payments',
    allPayments,
    paymentsCount,
  });
});

// Removed: buySubscription, verifySubscription, cancelSubscription
