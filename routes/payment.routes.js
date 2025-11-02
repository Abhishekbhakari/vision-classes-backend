import { Router } from 'express';
import {
  allPayments,
  getRazorpayApiKey,
  purchaseCourse,
  verifyCoursePayment,
} from '../controllers/payment.controller.js';
import { isLoggedIn } from '../middlewares/auth.middleware.js';

const router = Router();

router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);

// Routes for one-time course purchase
router.route('/purchase-course').post(isLoggedIn, purchaseCourse);
router.route('/verify-payment').post(isLoggedIn, verifyCoursePayment);

// Admin route
router.route('/').get(isLoggedIn, allPayments);

// --- REMOVED ROUTES ---
// router.route('/subscribe').post(isLoggedIn, buySubscription);
// router.route('/verify').post(isLoggedIn, verifySubscription);
// router.route('/unsubscribe').post(isLoggedIn, cancelSubscription);

export default router;