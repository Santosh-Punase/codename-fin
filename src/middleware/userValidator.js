import { body, validationResult } from 'express-validator';

import User from '../models/User.js';
import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { userErrorHandler } from '../utils/errorHandler.js';

const userValidationRules = [
  body('email')
    .isEmail()
    .withMessage(VALIDATION_ERROR_CODES.INVALID_EMAIL)
    .custom(async (email) => {
      const user = await User.findOne({ email });
      if (user) throw new Error();
    })
    .withMessage(VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS),
  body('password')
    .isLength({ min: 6, max: 12 })
    .withMessage(VALIDATION_ERROR_CODES.INVALID_PASSWORD_LENGTH),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage(VALIDATION_ERROR_CODES.PASSWORD_DO_NOT_MATCH),
];

const validateUser = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }

  const error = userErrorHandler(errors.array()[0]);
  return res.status(400).json({ error });
};

export {
  userValidationRules,
  validateUser,
};
