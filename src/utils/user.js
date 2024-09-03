import BankAccount from '../models/BankAccount.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';
import { defaultCategories } from './seed.js';

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
  const account = new BankAccount({ name: 'Bank', balance: 0, user: userId });
  await account.save();
  const defaultPaymentModes = [
    {
      type: 'Bank', name: 'Online', balance: 0, bankAccount: account._id, user: userId,
    },
    {
      type: 'Cash', name: 'Cash', balance: 0, user: userId,
    },
  ];
  return PaymentMode.insertMany(defaultPaymentModes);
};
