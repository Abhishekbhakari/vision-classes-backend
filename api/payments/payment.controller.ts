import { Request, Response } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { paymentService } from './payment.service.js';
import { HttpCode } from '../../constants/httpCode.js';

class PaymentController {
  public getRazorpayApiKey = asyncHandler(async (_req: Request, res: Response) => {
    const key = paymentService.getRazorpayKey();
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Razorpay API key',
      key,
    });
  });

  public createPaymentOrder = asyncHandler(async (req: Request, res: Response) => {
    const { courseId } = req.body;
    const userId = req.user!.id;
    const result = await paymentService.createPaymentOrder(courseId, userId);
    res.status(HttpCode.OK).json({
      success: true,
      message: result.message,
      ...result,
    });
  });

  public verifyPayment = asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const user = await paymentService.verifyPayment(userId, req.body);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Payment verified successfully',
      user,
    });
  });

  public buySubscription = asyncHandler(async (req: Request, res: Response) => {
    const subscription_id = await paymentService.buySubscription(req.user!.id);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Subscribed successfully',
      subscription_id,
    });
  });

  public verifySubscription = asyncHandler(async (req: Request, res: Response) => {
    await paymentService.verifySubscription(req.user!.id, req.body);
    res.status(HttpCode.OK).json({
      success: true,
      message: 'Payment verified successfully',
    });
  });

  public cancelSubscription = asyncHandler(async (req: Request, res: Response) => {
    const message = await paymentService.cancelSubscription(req.user!.id);
    res.status(HttpCode.OK).json({
      success: true,
      message,
    });
  });

  public allPayments = asyncHandler(async (req: Request, res: Response) => {
    const { count, skip } = req.query;
    const stats = await paymentService.getAllPaymentsStats(
      count ? Number(count) : undefined,
      skip ? Number(skip) : undefined
    );
    
    res.status(HttpCode.OK).json({
      success: true,
      message: 'All payments',
      ...stats,
    });
  });
}

export const paymentController = new PaymentController();