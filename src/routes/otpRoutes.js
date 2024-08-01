import express from 'express';

import { sendOtp, verifyOtp } from '../controllers/otpController.js';
import {
  otpEmailValidationRules,
  otpValidationRules,
  validateOtp,
} from '../middleware/otpValidator.js';

const router = express.Router();

router.post('/send', otpEmailValidationRules, validateOtp, sendOtp);
router.post('/verify', otpValidationRules, validateOtp, verifyOtp);

export default router;
