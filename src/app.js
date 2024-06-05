import express from 'express';
import helmet from 'helmet';
// import cors from 'cors';

import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import limiter from './middleware/rateLimiter.js';

const app = express();

// Rate Limiting
app.use(limiter());

// Security Headers
app.use(helmet());

// CORS
// const corsOptions = {
//   origin: 'http://example.com', // Replace with your domain
//   optionsSuccessStatus: 200,
// };
// app.use(cors(corsOptions));

// Connect to database
connectDB();

// Body Parser Middleware
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);

export default app;
