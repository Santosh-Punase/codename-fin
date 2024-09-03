import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { bankAccountErrorHandler } from '../utils/errorHandler.js';

const bankAccountValidationRules = [
  body('name')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.BANK_ACCOUNT_NAME_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_BANK_ACCOUNT_NAME),
  body('balance')
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR_CODES.BANK_ACCOUNT_BALANCE_IS_REQUIRED)
    .isNumeric()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_BANK_BALANCE),
];

const validateBankAccount = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = bankAccountErrorHandler(errors.array()[0]);

  return res.status(400).json({ error });
};

export {
  bankAccountValidationRules,
  validateBankAccount,
};
