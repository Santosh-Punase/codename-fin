import Transaction from '../models/Transaction.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { TRANSACTION_TYPE } from '../config/contants.js';

export const createTransaction = async ({
  userId, amount, remark, type, date, categoryId, paymentModeId, transferToId,
}) => {
  const transaction = new Transaction({
    user: userId,
    amount,
    remark,
    type,
    date,
    category: categoryId,
    paymentMode: paymentModeId,
    transferTo: transferToId,
  });

  await transaction.save();
  return {
    amount, remark, type, date,
  };
};

export const validateTransaction = async (transactionId, userId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, user: userId });
  if (!transaction) {
    throw new Error('TRANSACTION_NOT_FOUND');
  }
  return transaction;
};

export const transactionErrorResponse = (errorMsg, defaultMsg) => {
  const errorResponse = {
    statusCode: 500,
    errorCode: ERROR_CODES[defaultMsg],
    errorMessage: ERROR[defaultMsg],
  };

  if ([
    'TRANSACTION_NOT_FOUND',
    'CATEGORY_NOT_FOUND',
    'PAYMENT_MODE_NOT_FOUND',
    'BANK_ACCOUNT_NOT_FOUND',
  ].includes(errorMsg)) {
    errorResponse.statusCode = 404;
    errorResponse.errorCode = ERROR_CODES[errorMsg];
    errorResponse.errorMessage = ERROR[errorMsg];
  }

  return errorResponse;
};

export const transactionContainsCategory = (t) => (
  [TRANSACTION_TYPE.INCOME, TRANSACTION_TYPE.EXPENSE].includes(t)
);
