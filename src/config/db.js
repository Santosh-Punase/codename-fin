import mongoose from 'mongoose';
import { DB_URI, DB_URI_TEST, NODE_ENV } from './env.js';

const connectDB = async () => {
  const URI = NODE_ENV === 'test' ? DB_URI_TEST : DB_URI;
  try {
    await mongoose.connect(URI);
    console.log('MongoDB connected...');
  } catch (err) {
    console.error('error', err.message);
    process.exit(1);
  }
};

export default connectDB;
