import { Request, Response, NextFunction } from 'express';
import asyncHandler from '../../utils/asyncHandler';
import {
    createOrder as createOrderService,
    verifyPayment as verifyPaymentService,
    getAllPayments as getAllPaymentsService
} from './payment.service';

export const createOrder = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.user!;
    const { courseId } = req.body;
    const result = await createOrderService(id, courseId, res);

    res.status(200).json(result);
});

export const verifyPayment = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.user!;
    const user = await verifyPaymentService(id, req.body, res);

    res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        user,
    });
});

export const getRazorpayApiKey = asyncHandler(async (_req: Request, res: Response, _next: NextFunction) => {
    res.status(200).json({
        success: true,
        message: 'Razorpay API key',
        key: process.env.RAZORPAY_KEY_ID,
    });
});

export const allPayments = asyncHandler(async (req: Request, res: Response, _next: NextFunction) => {
    const { count, skip } = req.query;
    const result = await getAllPaymentsService(Number(count) || 10, Number(skip) || 0);

    res.status(200).json({
        success: true,
        message: 'All payments',
        ...result,
    });
});
