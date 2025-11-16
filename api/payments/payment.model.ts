import { model, Schema } from 'mongoose';
import { IPayment, IPaymentModel } from './payment.interface.js';

const paymentSchema = new Schema<IPayment, IPaymentModel>(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    razorpay_subscription_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true, // This will add createdAt and updatedAt
  }
);

const Payment = model<IPayment, IPaymentModel>('Payment', paymentSchema);

export default Payment;