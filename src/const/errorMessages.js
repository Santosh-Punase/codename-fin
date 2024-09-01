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
  INVALID_PAYMENT_MODE: 'Please Enter a valid Payment Mode',
  INVALID_TRANSACTION_TYPE: 'Please enter a valid transaction type',

  INVALID_BUDGET: 'Please Enter a valid Budget',
  INVALID_CATEGORY_NAME: 'Please Enter a valid Name',
  INVALID_CATEGORY_TYPE: 'Please enter a valid type',

  INVALID_PAYMENT_MODE_NAME: 'Please Enter a valid Name',
  INVALID_BALANCE: 'Please Enter a valid Balance',
  INVALID_PAYMENT_MODE_TYPE: 'Please enter a valid type',

  INVALID_BANK_ACCOUNT_NAME: 'Please Enter a valid Name',
  INVALID_BANK_BALANCE: 'Please Enter a valid Balance',
};

const ERROR = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_AUTHORIZED: 'Not authorized',

  SERVER_ERROR: 'Server error',
  USER_NOT_FOUND: 'User not found',

  ACCOUNT_LOCKED_FOR_THE_DAY: 'Your account is frozen for the day. Please continue after 24 hours',
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
  PAYMENT_MODE_NOT_FOUND: 'Payment mode not found',

  ADD_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_CATEGORY_FAILED: 'No categoris found',
  UPDATE_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST: 'This category does not exist',
  UPDATE_FAILED_CATEGORY_UNAUTHORIZED: 'You are not allowed to update this category',
  DELETE_CATEGORY_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_CATEGORY_DOES_NOT_EXIST: 'This category does not exist',
  DELETE_FAILED_CATEGORY_UNAUTHORIZED: 'You are not allowed to delete this category',
  INVALID_BUDGETS: 'Budgets array is required and should not be empty.',
  BUDGET_UPDATE_FAILED: VALIDATION_ERROR.DEFAULT,

  ADD_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_PAYMENT_MODE_FAILED: 'No payment modes found',
  UPDATE_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 'This payment mode does not exist',
  UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 'You are not allowed to update this payment mode',
  DELETE_PAYMENT_MODE_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST: 'This payment mode does not exist',
  DELETE_FAILED_PAYMENT_MODE_UNAUTHORIZED: 'You are not allowed to delete this payment mode',

  ADD_BANK_ACCOUNT_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_BANK_ACCOUNT_FAILED: 'No bank account found',
  UPDATE_BANK_ACCOUNT_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST: 'This bank account does not exist',
  UPDATE_FAILED_BANK_ACCOUNT_UNAUTHORIZED: 'You are not allowed to update this bank account',
  DELETE_BANK_ACCOUNT_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST: 'This bank account does not exist',
  DELETE_FAILED_BANK_ACCOUNT_UNAUTHORIZED: 'You are not allowed to delete this bank account',

  RESET_ACCOUNT_DATA_FAILED_NO_PARAMS:
    'No reset parameters provided. Please specify at least one reset option.',
};

export { VALIDATION_ERROR, ERROR };
