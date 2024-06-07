const VALIDATION_ERROR = {
  DEFAULT: 'Something went wrong!',

  INVALID_EMAIL: 'Please Enter a valid email',
  EMAIL_ALREADY_EXISTS: 'User already exists',
  INVALID_PASSWORD_LENGTH: 'Password should be 6 to 12 characters',
  PASSWORD_DO_NOT_MATCH: 'Password do not match',

  INVALID_AMOUNT: 'Please Enter a valid Amount',
  INVALID_REMARK: 'Please Enter a valid Remark',
  INVALID_CATEGORY: 'Please Enter a valid Category',
};

const ERROR = {
  INVALID_CREDENTIALS: 'Invalid credentials',
  NOT_AUTHORIZED: 'Not authorized',

  ADD_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  GET_TRANSACTION_FAILED: 'No records found',
  UPDATE_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST: 'This record does not exist',
  UPDATE_FAILED_TRANSACTION_UNAUTHORIZED: 'You are not allowed to update this record',
  DELETE_TRANSACTION_FAILED: VALIDATION_ERROR.DEFAULT,
  DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST: 'This record does not exist',
  DELETE_FAILED_TRANSACTION_UNAUTHORIZED: 'You are not allowed to delete this record',
};

export { VALIDATION_ERROR, ERROR };
