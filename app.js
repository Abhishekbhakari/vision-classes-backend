import { config } from 'dotenv';
config();
import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

// Debug: print configured FRONTEND_URL at startup (helpful while developing)
// Normalize FRONTEND_URL by removing any trailing slash so it matches the
// browser's Origin header (which does not include a trailing slash).
const RAW_FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';
const FRONTEND_URL = RAW_FRONTEND.replace(/\/$/, '');
console.log('Configured FRONTEND_URL (raw):', RAW_FRONTEND);
console.log('Configured FRONTEND_URL (normalized):', FRONTEND_URL);

// Middlewares
// Built-In
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Third-Party
// Configure CORS. When sending credentials (cookies) the Access-Control-Allow-Origin
// header must be a specific origin (not '*'). Use FRONTEND_URL from env or fallback
// to localhost:3000 for development.
// Lightweight CORS handling using the normalized FRONTEND_URL. Keeping this
// manual layer makes it easier to see headers while debugging. This ensures
// Access-Control-Allow-Origin exactly matches the browser Origin.
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', FRONTEND_URL);
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  // Allow common methods for preflight
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');

  // If this is a preflight request, respond immediately
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});
app.use(morgan('dev'));
app.use(cookieParser());

// Debug middleware: log incoming Origin header to help debug CORS problems
app.use((req, _res, next) => {
  if (req.headers && req.headers.origin) {
    console.log('[CORS DEBUG] request origin:', req.headers.origin);
  }
  next();
});

// Server Status Check Route
app.get('/ping', (_req, res) => {
  res.send('Pong');
});

// Import all routes
import userRoutes from './routes/user.routes.js';
import courseRoutes from './routes/course.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import miscRoutes from './routes/miscellaneous.routes.js';

app.use('/api/v1/user', userRoutes);
app.use('/api/v1/courses', courseRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1', miscRoutes);

// Default catch all route - 404
app.all('*', (_req, res) => {
  res.status(404).send('OOPS!!! 404 Page Not Found');
});

// Custom error handling middleware
app.use(errorMiddleware);

export default app;
