const VALIDATION_ERROR_CODES = {
  DEFAULT: 11000,

  INVALID_EMAIL: 10000,
  EMAIL_ALREADY_EXISTS: 10001,
  INVALID_PASSWORD_LENGTH: 10010,
  PASSWORD_DO_NOT_MATCH: 10011,

  AMOUNT_IS_REQUIRED: 20010,
  INVALID_AMOUNT: 20011,
  REMARK_IS_REQUIRED: 20020,
  INVALID_REMARK: 20021,
  CATEGORY_IS_REQUIRED: 20030,
  INVALID_CATEGORY: 20031,
  TRANSACTION_TYPE_IS_REQUIRED: 20040,
  TRANSACTION_TYPE_IS_INVALID: 20041,

  BUDGET_IS_REQUIRED: 30010,
  INVALID_BUDGET: 30011,
  CATEGORY_NAME_IS_REQUIRED: 30020,
  INVALID_CATEGORY_NAME: 30021,

  PAYMENT_MODE_NAME_IS_REQUIRED: 40010,
  INVALID_PAYMENT_MODE_NAME: 40011,
};

const ERROR_CODES = {
  INVALID_CREDENTIALS: 30000,
  NOT_AUTHORIZED: 30001,

  ADD_TRANSACTION_FAILED: 40000,
  GET_TRANSACTION_FAILED: 40010,
  UPDATE_TRANSACTION_FAILED: 40020,
  UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST: 40021,
  UPDATE_FAILED_TRANSACTION_UNAUTHORIZED: 40022,
  DELETE_TRANSACTION_FAILED: 40030,
  DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST: 40031,
  DELETE_FAILED_TRANSACTION_UNAUTHORIZED: 40032,
  CATEGORY_NOT_FOUND: 40033,

  ADD_CATEGORY_FAILED: 50000,
  GET_CATEGORY_FAILED: 50010,
  UPDATE_CATEGORY_FAILED: 50020,
  UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST: 50021,
  UPDATE_FAILED_CATEGORY_UNAUTHORIZED: 50022,
  DELETE_CATEGORY_FAILED: 50030,
  DELETE_FAILED_CATEGORY_DOES_NOT_EXIST: 50031,
  DELETE_FAILED_CATEGORY_UNAUTHORIZED: 50032,

  ADD_PAYMENT_MODE_FAILED: 60000,
  GET_PAYMENT_MODE_FAILED: 60010,
  UPDATE_PAYMENT_MODE_FAILED: 60020,
  UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 60021,
  UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 60022,
  DELETE_PAYMENT_MODE_FAILED: 60030,
  DELETE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 60031,
  DELETE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 60032,
};

export { VALIDATION_ERROR_CODES, ERROR_CODES };
