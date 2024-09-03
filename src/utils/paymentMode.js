import PaymentMode from '../models/PaymentMode.js';
import BankAccount from '../models/BankAccount.js';
import { PAYMENT_MODE_TYPE, TRANSACTION_TYPE } from '../config/contants.js';

export const isBankLinkedPaymentMode = (pmodeType) => pmodeType === PAYMENT_MODE_TYPE.BANK;

export const validateBankAccount = async (bankAccountId, userId) => {
  const bankAccount = await BankAccount.findOne({ _id: bankAccountId, user: userId });
  if (!bankAccount) {
    throw new Error('BANK_ACCOUNT_NOT_FOUND');
  }
  return bankAccount;
};

export const validatePaymentMode = async (paymentModeId, userId) => {
  const paymentMode = await PaymentMode.findOne({ _id: paymentModeId, user: userId });
  if (!paymentMode) {
    throw new Error('PAYMENT_MODE_NOT_FOUND');
  }
  if (isBankLinkedPaymentMode(paymentMode.type)) {
    const bankAccount = await BankAccount.findOne({ _id: paymentMode.bankAccount, user: userId });
    if (!bankAccount) {
      throw new Error('BANK_ACCOUNT_NOT_FOUND');
    }
    return [paymentMode, bankAccount];
  }
  return [paymentMode];
};

export const updatePaymentMode = async (paymentMode, amount, bankAccount) => {
  if (bankAccount) {
    // eslint-disable-next-line no-param-reassign
    bankAccount.balance += amount;
    await bankAccount.save();
  } else {
    // eslint-disable-next-line no-param-reassign
    paymentMode.balance += amount;
    await paymentMode.save();
  }
};

export const updatePaymentModeAmount = async (paymentMode, type, amount, bankAccount) => {
  const balanceToUpdate = type === TRANSACTION_TYPE.EXPENSE ? -amount : amount;
  await updatePaymentMode(paymentMode, balanceToUpdate, bankAccount);
};

export const revertPaymentModeAmount = async (paymentMode, type, amount, bankAccount) => {
  const balanceToUpdate = type === TRANSACTION_TYPE.EXPENSE ? amount : -amount;
  await updatePaymentMode(paymentMode, balanceToUpdate, bankAccount);
};
