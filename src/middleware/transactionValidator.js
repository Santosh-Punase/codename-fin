import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR } from '../const/errorMessages.js';

const transactionValidationRules = [
  body('amount')
    .isNumeric()
    .withMessage(VALIDATION_ERROR.INVALID_AMOUNT),
  body('remark')
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR.EMPTY_REMARK)
    .isString()
    .withMessage(VALIDATION_ERROR.INVALID_REMARK),
  body('category')
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR.EMPTY_CATEGORY)
    .isString()
    .withMessage(VALIDATION_ERROR.INVALID_CATEGORY),
];

const validateTransaction = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  return res.status(400).json({ errors: errors.array()[0] });
};

export {
  transactionValidationRules,
  validateTransaction,
};
