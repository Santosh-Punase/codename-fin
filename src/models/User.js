import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { SALT_ROUND } from '../config/contants.js';

const currencySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  symbol: {
    type: String,
    required: true,
  },
  locale: {
    type: String,
    required: true,
  },
  currencyCode: {
    type: String,
    required: true,
  },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  currency: {
    type: currencySchema,
    required: false,
  },
}, { timestamps: true });

UserSchema.pre('save', async function encrypt(next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(SALT_ROUND);
  this.password = await bcrypt.hash(this.password, salt);
  return next();
});

UserSchema.methods.matchPassword = async function matchPassword(enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

export default mongoose.model('User', UserSchema);
