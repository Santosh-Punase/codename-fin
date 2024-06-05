import { body, validationResult } from 'express-validator';

import { VALIDATION_ERROR } from '../const/errorMessages.js';

const userValidationRules = [
  body('email')
    .isEmail()
    .withMessage(VALIDATION_ERROR.INVALID_EMAIL),
  body('password')
    .isLength({ min: 6, max: 12 })
    .withMessage(VALIDATION_ERROR.INVALID_PASSWORD_LENGTH),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage(VALIDATION_ERROR.PASSWORD_DO_NOT_MATCH),
];

const validateUser = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  }
  return res.status(400).json({ errors: errors.array()[0] });
};

export {
  userValidationRules,
  validateUser,
};
