import { v2 } from 'cloudinary';
import Razorpay from 'razorpay';

import app from './app.js';
import connectToDB from './configs/dbConn.js';

// Cloudinary configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Razorpay configuration
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

const PORT = process.env.PORT || 5000;

// Global handlers to log uncaught exceptions/rejections for debugging (will help trace connection resets)
process.on('uncaughtException', (err) => {
  // eslint-disable-next-line no-console
  console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
  // Optionally exit or keep running for debugging. For now, keep running to avoid service interruption while we debug.
});

process.on('unhandledRejection', (reason, promise) => {
  // eslint-disable-next-line no-console
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

app.listen(PORT, async () => {
  // Connect to DB
  await connectToDB();
  console.log(`App is running at http://localhost:${PORT}`);
});
