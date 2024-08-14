import mongoose from 'mongoose';

import { PAYMENT_MODE_TYPES } from '../config/contants.js';

const paymentModeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: PAYMENT_MODE_TYPES,
    required: true,
  },
  balance: {
    type: Number,
    required: true,
  },
}, { timestamps: true });

export default mongoose.model('PaymentMode', paymentModeSchema);
