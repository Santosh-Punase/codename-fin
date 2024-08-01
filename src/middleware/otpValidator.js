import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { otpErrorHandler } from '../utils/errorHandler.js';

const otpEmailValidationRules = [
  body('email')
    .isEmail()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_EMAIL),
];

const otpValidationRules = [
  body('email')
    .isEmail()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_EMAIL),
  body('otp')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_OTP),
];

const validateOtp = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const error = otpErrorHandler(errors.array()[0]);
  return res.status(400).json({ error });
};

export {
  otpEmailValidationRules,
  otpValidationRules,
  validateOtp,
};
