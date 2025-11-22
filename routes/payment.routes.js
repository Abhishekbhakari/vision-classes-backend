// import { Router } from 'express';
// import {
//   getRazorpayApiKey,
//   buySubscription,
//   verifySubscription,
//   cancelSubscription,
//   allPayments,
// } from '../controllers/payment.controller.js';
// import {
//   authorizeRoles,
//   authorizeSubscribers,
//   isLoggedIn,
// } from '../middlewares/auth.middleware.js';

// const router = Router();

// router.route('/subscribe').post(isLoggedIn, buySubscription);
// router.route('/verify').post(isLoggedIn, verifySubscription);
// router
//   .route('/unsubscribe')
//   .post(isLoggedIn, authorizeSubscribers, cancelSubscription);
// router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);
// router.route('/').get(isLoggedIn, authorizeRoles('ADMIN'), allPayments);

// export default router;
import { Router } from 'express';
import {
  getRazorpayApiKey,
  createOrder,
  verifyPayment,
  allPayments,
} from '../controllers/payment.controller.js';
import {
  authorizeRoles,
  authorizeSubscribers,
  isLoggedIn,
} from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/create-order').post(isLoggedIn, createOrder);
router.route('/verify-payment').post(isLoggedIn, verifyPayment);
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);
router.route('/').get(isLoggedIn, authorizeRoles('ADMIN'), allPayments);

export default router;
