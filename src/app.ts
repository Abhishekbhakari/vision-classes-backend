import 'dotenv/config';
import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';

import errorMiddleware from './middlewares/error.middleware';
import userRoutes from './api/user/user.routes';
import courseRoutes from './api/course/course.routes';
import paymentRoutes from './api/payment/payment.routes';
import pastPaperRoutes from './api/pastPaper/pastPaper.routes';
import miscRoutes from './api/miscellaneous/miscellaneous.routes';



const app = express();

// Middlewares
app.use(
    cors({
        origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
        credentials: true,
    })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet());

// Server routes
app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/pastpapers', pastPaperRoutes);
app.use('/api/v1', miscRoutes);

// Default catch all route - 404
app.all('*', (_req: Request, res: Response) => {
    res.status(404).send('OOPS! 404 page not found');
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;
