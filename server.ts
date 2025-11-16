import { v2 as cloudinary } from 'cloudinary';
import Razorpay from 'razorpay';
import 'dotenv/config'; // Make sure to install 'dotenv'

import app from './app.js';
import connectToDB from './database/configs/mongoose.js';
import { winstonLogger } from './utils/winstonLogger.js';

// --- External Service Configuration ---
// Cloudinary configuration (from old server.js)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
winstonLogger.info('Cloudinary configured');

// Razorpay configuration (from old server.js)
export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});
winstonLogger.info('Razorpay configured');
// ----------------------------------------

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  // Connect to DB (from old server.js)
  await connectToDB();
  winstonLogger.info(`App is running at http://localhost:${PORT}`);
});