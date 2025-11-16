import { Router } from 'express';
import { paymentController } from './payment.controller.js';
import {
  isLoggedIn,
  authorizeRoles,
  authorizeSubscribers,
} from '../auth/auth.middleware.js';
import { validate } from '../../utils/zodErrorHandler.js';
import {
  verifySubscriptionSchema,
  allPaymentsSchema,
} from './payment.validation.js';

const router = Router();

router.get('/razorpay-key', isLoggedIn, paymentController.getRazorpayApiKey);

// Course payment endpoints
router.post('/create-order', isLoggedIn, paymentController.createPaymentOrder);
router.post('/verify-payment', isLoggedIn, paymentController.verifyPayment);

// Subscription endpoints (optional)
router.post('/subscribe', isLoggedIn, paymentController.buySubscription);

router.post(
  '/verify',
  isLoggedIn,
  validate(verifySubscriptionSchema),
  paymentController.verifySubscription
);

router.post(
  '/unsubscribe',
  isLoggedIn,
  authorizeSubscribers,
  paymentController.cancelSubscription
);

router.get(
  '/',
  isLoggedIn,
  authorizeRoles('ADMIN'),
  validate(allPaymentsSchema),
  paymentController.allPayments
);

export default router;