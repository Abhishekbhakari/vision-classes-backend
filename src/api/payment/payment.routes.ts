import { Router } from 'express';
import {
    getRazorpayApiKey,
    createOrder,
    verifyPayment,
    allPayments,
} from './payment.controller';
import {
    authorizeRoles,
    isLoggedIn,
} from '../../middlewares/auth.middleware';
import validate from '../../middlewares/validate.middleware';
import { createOrderSchema, verifyPaymentSchema } from './payment.schema';

const router = Router();

router.route('/create-order').post(isLoggedIn, validate(createOrderSchema), createOrder);
router.route('/verify-payment').post(isLoggedIn, validate(verifyPaymentSchema), verifyPayment);
router.route('/razorpay-key').get(isLoggedIn, getRazorpayApiKey);
router.route('/').get(isLoggedIn, authorizeRoles('ADMIN'), allPayments);

export default router;
