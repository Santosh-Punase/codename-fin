import mongoose from 'mongoose';

import { DB_URI, DB_URI_TEST } from './env.js';
import { isTestEnv } from '../utils/index.js';

const connectDB = async () => {
  const URI = isTestEnv() ? DB_URI_TEST : DB_URI;

  try {
    await mongoose.connect(URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('error', err.message);
    process.exit(1);
  }
};

export default connectDB;
