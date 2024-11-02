import BankAccount from '../models/BankAccount.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';
import { defaultBankAccount, defaultCategories, defaultPaymentModes } from './seed.js';

export const deleteAllCategories = async (userId) => Category.deleteMany({ user: userId });

export const deleteAllBankAccounts = async (userId) => BankAccount.deleteMany({ user: userId });

export const deleteAllPaymentModes = async (userId) => {
  await deleteAllBankAccounts(userId);
  return PaymentMode.deleteMany({ user: userId });
};

export const initialiseWithDefaultCategories = async (userId) => {
  const defaultCategoriesWithUser = defaultCategories
    .map((category) => ({ ...category, user: userId }));
  return Category.insertMany(defaultCategoriesWithUser);
};

export const resetCategoriesExpenditure = async (userId) => Category.updateMany(
  { user: userId },
  { $set: { expenditure: 0 } },
);

export const initialiseWithDefaultPaymentModes = async (userId) => {
  const account = new BankAccount({ ...defaultBankAccount, user: userId });
  await account.save();
  const defaultPaymentModesWithUser = defaultPaymentModes.map((p) => (
    { ...p, user: userId, bankAccount: p.type === 'Bank' ? account._id : undefined }
  ));
  return PaymentMode.insertMany(defaultPaymentModesWithUser);
};
