import { z } from 'zod';

export const verifySubscriptionSchema = z.object({
  body: z.object({
    razorpay_payment_id: z.string(),
    razorpay_subscription_id: z.string(),
    razorpay_signature: z.string(),
  }),
});

export const allPaymentsSchema = z.object({
  query: z.object({
    count: z.coerce.number().int().positive().optional(),
    skip: z.coerce.number().int().min(0).optional(),
  }),
});