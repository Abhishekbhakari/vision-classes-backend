// import { model, Schema } from 'mongoose';

// const paymentSchema = new Schema(
//   {
//     razorpay_payment_id: {
//       type: String,
//       required: true,
//     },
//     razorpay_subscription_id: {
//       type: String,
//       required: true,
//     },
//     razorpay_signature: {
//       type: String,
//       required: true,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// const Payment = model('Payment', paymentSchema);

// export default Payment;
import { model, Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    razorpay_payment_id: {
      type: String,
    },
    razorpay_order_id: {
      type: String,
      required: true,
    },
    razorpay_signature: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['created', 'success', 'failed'],
      default: 'created',
    },
  },
  {
    timestamps: true,
  }
);

const Payment = model('Payment', paymentSchema);

export default Payment;
