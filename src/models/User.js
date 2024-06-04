import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { SALT_ROUND } from '../config/contants.js';

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
