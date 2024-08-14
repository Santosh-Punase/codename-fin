import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { categoryErrorHandler } from '../utils/errorHandler.js';
import { CATEGORY_TYPES } from '../config/contants.js';

const categoryValidationRules = [
  body('name')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.CATEGORY_NAME_IS_REQUIRED)
    .custom((value) => typeof value === 'string' && !!value.trim())
    .withMessage(VALIDATION_ERROR_CODES.INVALID_CATEGORY_NAME),
  body('budget')
    .custom((value) => !!value)
    .withMessage(VALIDATION_ERROR_CODES.BUDGET_IS_REQUIRED)
    .isNumeric()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_BUDGET),
  body('type')
    .exists()
    .withMessage(VALIDATION_ERROR_CODES.CATEGORY_TYPE_IS_REQUIRED)
    .isIn(CATEGORY_TYPES)
    .withMessage(VALIDATION_ERROR_CODES.CATEGORY_TYPE_IS_INVALID),
];

const validateCategory = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const error = categoryErrorHandler(errors.array()[0]);

  return res.status(400).json({ error });
};

export {
  categoryValidationRules,
  validateCategory,
};
