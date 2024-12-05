import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoute from './routes/healthRoute.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import paymentModeRoutes from './routes/paymentModeRoutes.js';
import bankAccountRoutes from './routes/bankAccountRoutes.js';
import otpRoutes from './routes/otpRoutes.js';
import accountRoutes from './routes/accountRoutes.js';
import subscriptionRoutes from './routes/subscriptionRoutes.js';

import limiter from './middleware/rateLimiter.js';
import { CORS_DOMAIN } from './config/env.js';

const app = express();
app.set('trust proxy', 1);

// Rate Limiting
app.use(limiter());

// Security Headers
app.use(helmet());

// CORS
const corsOptions = {
  origin: CORS_DOMAIN,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Connect to database
connectDB();

// Body Parser Middleware
app.use(express.json());

// Routes
app.use('/api/otp', otpRoutes);
app.use('/api', accountRoutes);
app.use('/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment-modes', paymentModeRoutes);
app.use('/api/bank-accounts', bankAccountRoutes);
app.use('/api/subscription', subscriptionRoutes);

export default app;
