import mongoose from 'mongoose';

import { CATEGORY_TYPES } from '../config/contants.js';

const categorySchema = new mongoose.Schema({
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
    enum: CATEGORY_TYPES,
    required: true,
  },
  budget: {
    type: Number,
    required: true,
  },
  expenditure: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

export default mongoose.model('Category', categorySchema);
