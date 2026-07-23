import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import dotenv from 'dotenv';

import { generalLimiter } from './middleware/rateLimiter.js';
import errorHandler from './middleware/errorHandler.js';
import AppError from './utils/AppError.js';
import { uploadsRoot } from './utils/upload.js';

import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customer/index.js';
import adminRoutes from './routes/admin/index.js';

dotenv.config();

const app = express();

// Security headers — allow frontend/admin (other origins) to load /uploads images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS — allow storefront + admin (no trailing slash)
const normalizeOrigin = (url) => (url ? String(url).trim().replace(/\/$/, '') : '');

const allowedOrigins = [
  ...new Set(
    [
      process.env.FRONTEND_URL,
      process.env.ADMIN_URL,
      ...(process.env.ALLOWED_ORIGINS || '').split(','),
      'http://localhost:5173',
      'http://localhost:5174',
      'https://ecommerce-project-1-i8v1.onrender.com',
    ]
      .map(normalizeOrigin)
      .filter(Boolean)
  ),
];

app.use(
  cors({
    origin(origin, callback) {
      const reqOrigin = normalizeOrigin(origin);
      if (!reqOrigin || allowedOrigins.includes(reqOrigin)) {
        callback(null, true);
      } else {
        console.warn('CORS blocked origin:', origin, '| allowed:', allowedOrigins);
        callback(new AppError('Not allowed by CORS', 403));
      }
    },
    credentials: true,
  })
);

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Rate limiting
app.use('/api', generalLimiter);

// Local product image files (multer diskStorage)
app.use(
  '/uploads',
  express.static(uploadsRoot, {
    maxAge: '7d',
    fallthrough: true,
  })
);

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString(),
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', customerRoutes);
app.use('/api/admin', adminRoutes);

// 404 handler
app.all('*', (req, res, next) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
});

// Global error handler
app.use(errorHandler);

export default app;
