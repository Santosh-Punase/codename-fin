import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { paymentModeErrorHandler } from '../utils/errorHandler.js';

const paymentModeValidationRules = [
  body('name')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_NAME_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_PAYMENT_MODE_NAME),
];

const validatePaymentMode = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = paymentModeErrorHandler(errors.array()[0]);

  return res.status(400).json({ error });
};

export {
  paymentModeValidationRules,
  validatePaymentMode,
};
