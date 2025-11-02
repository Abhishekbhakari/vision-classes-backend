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
// abhishekbhakari/vision-classes-backend/vision-classes-backend-2abfd55e8e05597a6b97163bf590df4d98519459/models/Payment.model.js

import { model, Schema } from 'mongoose';

const paymentSchema = new Schema(
  {
    razorpay_payment_id: {
      type: String,
      required: true,
    },
    // --- MODIFICATION START ---
    razorpay_order_id: {
      type: String,
      required: true,
    },
    // --- MODIFICATION END ---
    razorpay_signature: {
      type: String,
      required: true,
    },
    // Optional: Add courseId and userId for better tracking
    // courseId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'Course'
    // },
    // userId: {
    //   type: Schema.Types.ObjectId,
    //   ref: 'User'
    // }
  },
  {
    timestamps: true,
  }
);

const Payment = model('Payment', paymentSchema);

export default Payment;

