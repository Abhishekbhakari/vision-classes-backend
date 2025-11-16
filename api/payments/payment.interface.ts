import type { Document, Model } from 'mongoose';

// Interface for the Payment document
export interface IPayment extends Document {
  razorpay_payment_id: string;
  razorpay_subscription_id: string;
  razorpay_signature: string;
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Payment model
export interface IPaymentModel extends Model<IPayment> {}