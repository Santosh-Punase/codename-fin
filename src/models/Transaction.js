import mongoose from 'mongoose';

import { TRANSACTION_TYPES } from '../config/contants.js';

const TransactionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  type: {
    type: String,
    enum: TRANSACTION_TYPES,
    required: true,
  },
  remark: {
    type: String,
    required: true,
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category',
  },
  date: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
