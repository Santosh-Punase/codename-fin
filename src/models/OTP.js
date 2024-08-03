import mongoose from 'mongoose';

const OtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  otp: {
    type: Number,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  requestCount: {
    type: Number,
    default: 0,
  },
});

export default mongoose.model('OTP', OtpSchema);
