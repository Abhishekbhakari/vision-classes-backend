import express from 'express';
import { config } from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import errorMiddleware from './middlewares/error.middleware.js';
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js'; // Assuming this file exists based on original

config();

const app = express();

// Middlewares
// We are using this because our frontend is hosted on a different server
app.use(
  cors({
    origin: [process.env.FRONTEND_URL],
    credentials: true,
  })
);

// ***** THIS IS THE FIX *****
// Increase the payload size limit for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
// **************************

app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());

// Server routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes); // Assuming this file exists based on original

// Default catch all route - 404
app.all('*', (_req, res) => {
  res.status(404).send('OOPS! 404 page not found');
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;
