import express, { Express, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { winstonLogger } from './utils/winstonLogger.js';
import { errorHandling } from './utils/errorHandling.js';
import allRoutes from './routes/index.js';

const app: Express = express();

// --- CORS Configuration ---
const RAW_FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const FRONTEND_URL = RAW_FRONTEND.replace(/\/$/, '');
// Allow development frontend on 3001 as well (CRA auto-prompts alternate port)
const allowedOrigins = [FRONTEND_URL, 'http://localhost:3001'];
winstonLogger.info(`Configured FRONTEND_URL (raw): ${RAW_FRONTEND}`);
winstonLogger.info(`Allowed origins: ${allowedOrigins.join(', ')}`);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// --- Body Parser and Cookie Parser ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// --- Routes ---
app.use('/api/v1', allRoutes);

// --- 404 Route ---
app.all('*', (_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: 'OOPS! 404 page not found',
  });
});

// --- Global Error Handling Middleware ---
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  errorHandling(err, req, res, next);
});

export default app;
