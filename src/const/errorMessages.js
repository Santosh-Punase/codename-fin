const VALIDATION_ERROR = {
  DEFAULT: 'Something went wrong!',

  INVALID_EMAIL: 'Please Enter a valid email',
  EMAIL_ALREADY_EXISTS: 'User already exists',
  INVALID_PASSWORD_LENGTH: 'Password should be 6 to 12 characters',
  PASSWORD_DO_NOT_MATCH: 'Password do not match',
  USERNAME_IS_REQUIRED: 'Please Enter a username',

  INVALID_OTP: 'OTP does not match',
  OTP_EXPIRED: 'OTP has expired',

  INVALID_AMOUNT: 'Please Enter a valid Amount',
  INVALID_REMARK: 'Please Enter a valid Remark',
  INVALID_CATEGORY: 'Please Enter a valid Category',

  INVALID_BUDGET: 'Please Enter a valid Budget',
  INVALID_CATEGORY_NAME: 'Please Enter a valid Name',
  INVALID_PAYMENT_MODE_NAME: 'Please Enter a valid Name',
  INVALID_TRANSACTION_TYPE: 'Please enter a valid transaction type',
};

const ERROR = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_AUTHORIZED: 'Not authorized',

  SERVER_ERROR: 'Server error',
  USER_NOT_FOUND: 'User not found',

  ACCOUNT_LOCKED_FOR_THE_DAY: 'Your account is locked for the day. Please continue after 24 hours',
  FAILED_TO_SEND_OTP: 'Failed to send OTP',

  ADD_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_TRANSACTION_FAILED: 'No transactions found',
  UPDATE_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST: 'This transaction does not exist',
  UPDATE_FAILED_TRANSACTION_UNAUTHORIZED: 'You are not allowed to update this transaction',
  DELETE_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST: 'This transaction does not exist',
  DELETE_FAILED_TRANSACTION_UNAUTHORIZED: 'You are not allowed to delete this transaction',
  CATEGORY_NOT_FOUND: 'Category not found',

  ADD_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_CATEGORY_FAILED: 'No categoris found',
  UPDATE_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST: 'This category does not exist',
  UPDATE_FAILED_CATEGORY_UNAUTHORIZED: 'You are not allowed to update this category',
  DELETE_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_CATEGORY_DOES_NOT_EXIST: 'This category does not exist',
  DELETE_FAILED_CATEGORY_UNAUTHORIZED: 'You are not allowed to delete this category',

  ADD_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_PAYMENT_MODE_FAILED: 'No payment modes found',
  UPDATE_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 'This payment mode does not exist',
  UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 'You are not allowed to update this payment mode',
  DELETE_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 'This payment mode does not exist',
  DELETE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 'You are not allowed to delete this payment mode',
};

export { VALIDATION_ERROR, ERROR };
