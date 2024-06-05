import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { transactionErrorHandler } from '../utils/errorHandler.js';

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
  body('category')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.CATEGORY_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_CATEGORY),
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
