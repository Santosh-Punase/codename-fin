import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { paymentModeErrorHandler } from '../utils/errorHandler.js';
import { PAYMENT_MODE_TYPES } from '../config/contants.js';
import { isBankLinkedPaymentMode } from '../utils/paymentMode.js';

const paymentModeValidationRules = [
  body('name')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_NAME_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_PAYMENT_MODE_NAME),
  body('type')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_TYPE_IS_REQUIRED)
    .isIn(PAYMENT_MODE_TYPES)
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_TYPE_IS_INVALID),
  body('balance')
    .if((_value, { req }) => !isBankLinkedPaymentMode(req.body.type))
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_BALANCE_IS_REQUIRED)
    .isNumeric()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_BALANCE),
  body('bankAccount')
    .if((_value, { req }) => isBankLinkedPaymentMode(req.body.type))
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_BANK_ACCOUNT_IS_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_PAYMENT_MODE_BANK_ACCOUNT),

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
