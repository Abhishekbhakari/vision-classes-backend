import 'dotenv/config';
import app from './app';
import connectToDB from './config/db';
import cloudinary from './config/cloudinary';
import razorpay from './config/razorpay';

const PORT = process.env.PORT || 5000;

// Global handlers to log uncaught exceptions/rejections
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err && err.stack ? err.stack : err);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Initialize Cloudinary and Razorpay (just importing them triggers config if they have side effects, 
// but here we just ensure they are available. Our config files handle the setup.)
// Actually, cloudinary config is done in src/config/cloudinary.ts which is imported in services.
// But we can import it here to be explicit or if there's any init logic.
// The original server.js did v2.config() here. Our src/config/cloudinary.ts does it on import.
// So importing it is enough.

app.listen(PORT, async () => {
    await connectToDB();
    console.log(`App is running at http://localhost:${PORT}`);
});
