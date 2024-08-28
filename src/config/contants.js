export const SALT_ROUND = 10;

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUEST: 100, // limit each IP to 100 requests per windowMs
  MAX_REQUEST_TEST: 1,
  MESSAGE: 'Too many requests from this IP, please try again later.',
};

export const TRANSACTION_TYPE = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
};

export const TRANSACTION_TYPES = [TRANSACTION_TYPE.INCOME, TRANSACTION_TYPE.EXPENSE];

export const CATEGORY_TYPE = {
  INCOME: 'Income',
  EXPENSE: 'Expense',
};

export const CATEGORY_TYPES = [CATEGORY_TYPE.INCOME, CATEGORY_TYPE.EXPENSE];

export const PAYMENT_MODE_TYPE = {
  BANK: 'Bank',
  CASH: 'Cash',
  WALLET: 'Wallet',
  CREDIT_CARD: 'Credit_Card',
};

export const PAYMENT_MODE_TYPES = [
  PAYMENT_MODE_TYPE.BANK,
  PAYMENT_MODE_TYPE.CASH,
  PAYMENT_MODE_TYPE.WALLET,
  PAYMENT_MODE_TYPE.CREDIT_CARD,
];

export const GENDER_TYPE = {
  MALE: 'Male',
  FEMALE: 'Female',
  Other: 'Other',
};

export const GENDER_TYPES = [GENDER_TYPE.MALE, GENDER_TYPE.FEMALE, GENDER_TYPE.Other];
