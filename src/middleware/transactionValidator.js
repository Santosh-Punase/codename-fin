import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { transactionErrorHandler } from '../utils/errorHandler.js';
import { TRANSACTION_TYPES } from '../config/contants.js';

const transactionValidationRules = [
  body('amount')
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR_CODES.AMOUNT_IS_REQUIRED)
    .isNumeric()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_AMOUNT),
  body('remark')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.REMARK_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_REMARK),
  body('type')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.TRANSACTION_TYPE_IS_REQUIRED)
    .isIn(TRANSACTION_TYPES)
    .withMessage(VALIDATION_ERROR_CODES.TRANSACTION_TYPE_IS_INVALID),
  body('category')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.CATEGORY_IS_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_CATEGORY),
  body('paymentMode')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.PAYMENT_MODE_IS_REQUIRED)
    .isMongoId()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_PAYMENT_MODE),
];

const validateTransaction = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = transactionErrorHandler(errors.array()[0]);

  // return res.status(400).json({ error: errors.array()[0] });
  return res.status(400).json({ error });
};

export {
  transactionValidationRules,
  validateTransaction,
};
