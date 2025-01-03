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
    required: false,
    ref: 'Category',
  },
  paymentMode: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'PaymentMode',
  },
  transferTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: false,
    ref: 'PaymentMode',
  },
  date: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('Transaction', TransactionSchema);
