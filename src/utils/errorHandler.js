import { VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { VALIDATION_ERROR } from '../const/errorMessages.js';

const userErrorHandler = (error) => {
  switch (error.path) {
    case 'email':
      if (error.msg === VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS) {
        return ({
          code: VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS,
          message: VALIDATION_ERROR.EMAIL_ALREADY_EXISTS,
        });
      }
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_EMAIL,
        message: VALIDATION_ERROR.INVALID_EMAIL,
      });
    case 'password':
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_PASSWORD_LENGTH,
        message: VALIDATION_ERROR.INVALID_PASSWORD_LENGTH,
      });
    case 'confirmPassword':
      return ({
        code: VALIDATION_ERROR_CODES.PASSWORD_DO_NOT_MATCH,
        message: VALIDATION_ERROR.PASSWORD_DO_NOT_MATCH,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

const transactionErrorHandler = (error) => {
  switch (error.path) {
    case 'amount':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_AMOUNT,
      });
    case 'remark':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_REMARK,
      });
    case 'category':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_CATEGORY,
      });
    case 'paymentMode':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_PAYMENT_MODE,
      });
    case 'transferTo':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_PAYMENT_MODE,
      });
    case 'type':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_TRANSACTION_TYPE,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

const categoryErrorHandler = (error) => {
  switch (error.path) {
    case 'name':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_CATEGORY_NAME,
      });
    case 'budget':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_BUDGET,
      });
    case 'type':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_CATEGORY_TYPE,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

const paymentModeErrorHandler = (error) => {
  switch (error.path) {
    case 'name':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_PAYMENT_MODE_NAME,
      });
    case 'balance':
      if (error.msg === VALIDATION_ERROR_CODES.PAYMENT_MODE_BALANCE_IS_REQUIRED) {
        return ({
          code: VALIDATION_ERROR_CODES.PAYMENT_MODE_BALANCE_IS_REQUIRED,
          message: VALIDATION_ERROR.INVALID_BALANCE,
        });
      }
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_BALANCE,
        message: VALIDATION_ERROR.INVALID_BALANCE,
      });
    case 'type':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_PAYMENT_MODE_TYPE,
      });
    case 'bankAccount':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_PAYMENT_MODE_BANK_ACCOUNT,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

const otpErrorHandler = (error) => {
  switch (error.path) {
    case 'email':
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_EMAIL,
        message: VALIDATION_ERROR.INVALID_EMAIL,
      });
    case 'otp':
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_OTP,
        message: VALIDATION_ERROR.INVALID_OTP,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

const bankAccountErrorHandler = (error) => {
  switch (error.path) {
    case 'name':
      return ({
        code: error.msg,
        message: VALIDATION_ERROR.INVALID_BANK_ACCOUNT_NAME,
      });
    case 'balance':
      if (error.msg === VALIDATION_ERROR_CODES.BANK_ACCOUNT_BALANCE_IS_REQUIRED) {
        return ({
          code: VALIDATION_ERROR_CODES.BANK_ACCOUNT_BALANCE_IS_REQUIRED,
          message: VALIDATION_ERROR.INVALID_BANK_BALANCE,
        });
      }
      return ({
        code: VALIDATION_ERROR_CODES.INVALID_BANK_BALANCE,
        message: VALIDATION_ERROR.INVALID_BANK_BALANCE,
      });
    default:
      return ({
        code: VALIDATION_ERROR_CODES.DEFAULT,
        message: VALIDATION_ERROR.DEFAULT,
      });
  }
};

export {
  userErrorHandler,
  transactionErrorHandler,
  categoryErrorHandler,
  paymentModeErrorHandler,
  otpErrorHandler,
  bankAccountErrorHandler,
};
