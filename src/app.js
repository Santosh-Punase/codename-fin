import express from 'express';
import helmet from 'helmet';
import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import healthRoute from './routes/healthRoute.js';
import transactionRoutes from './routes/transactionRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';

import limiter from './middleware/rateLimiter.js';
import { CORS_DOMAIN } from './config/env.js';

const app = express();

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
app.use('/health', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/categories', categoryRoutes);

export default app;
