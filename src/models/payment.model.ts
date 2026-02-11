import { Schema, model, Document, Types } from 'mongoose';

export interface IPayment extends Document {
    razorpay_payment_id?: string;
    razorpay_order_id: string;
    razorpay_signature?: string;
    userId: Types.ObjectId;
    courseId: Types.ObjectId;
    amount: number;
    status: 'created' | 'success' | 'failed';
    createdAt: Date;
    updatedAt: Date;
}

const paymentSchema = new Schema<IPayment>(
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

const Payment = model<IPayment>('Payment', paymentSchema);

export default Payment;
