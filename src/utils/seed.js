import { CATEGORY_TYPE } from '../config/contants.js';

export const defaultCategories = [
  {
    name: 'Groceries', type: CATEGORY_TYPE.EXPENSE, budget: 0, expenditure: 0,
  },
  {
    name: 'Rent', type: CATEGORY_TYPE.EXPENSE, budget: 0, expenditure: 0,
  },
  {
    name: 'Commute', type: CATEGORY_TYPE.EXPENSE, budget: 0, expenditure: 0,
  },
  {
    name: 'Utilities', type: CATEGORY_TYPE.EXPENSE, budget: 0, expenditure: 0,
  },
  {
    name: 'Salary', type: CATEGORY_TYPE.INCOME, budget: 0, expenditure: 0,
  },
  {
    name: 'Other', type: CATEGORY_TYPE.EXPENSE, budget: 0, expenditure: 0,
  },
];

export const defaultBankAccount = { name: 'My Bank', balance: 0 };

export const defaultPaymentModes = [
  { type: 'Bank', name: 'Online', balance: 0 },
  { type: 'Wallet', name: 'Cash', balance: 0 },
];
