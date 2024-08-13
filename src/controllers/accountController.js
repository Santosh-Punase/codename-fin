import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';

import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';

export const getAccountSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalIncome = 0;
    let totalExpense = 0;

    transactions.forEach((transaction) => {
      if (transaction._id === 'income') {
        totalIncome = transaction.total;
      } else if (transaction._id === 'expense') {
        totalExpense = transaction.total;
      }
    });

    const categories = await Category.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalBudget: { $sum: '$budget' },
          totalExpenditure: { $sum: '$expenditure' },
        },
      },
    ]);

    const totalBudget = categories[0] ? categories[0].totalBudget : 0;
    const totalExpenditure = categories[0] ? categories[0].totalExpenditure : 0;

    const paymentModes = await PaymentMode.find({ user: userId }).lean();
    const paymentModeBalances = paymentModes.map((mode) => ({
      name: mode.name,
      balance: mode.balance,
    }));

    const netAccountBalance = totalIncome - totalExpense;

    return res.json({
      totalIncome,
      totalExpense,
      netAccountBalance,
      totalMonthlyBudget: totalBudget,
      totalMonthlyExpenditure: totalExpenditure,
      paymentModes: paymentModeBalances,
    });
  } catch (err) {
    logger.error(`Unable to get account summary for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.GET_ACCOUNT_SUMMARY_FAILED,
        message: ERROR.SERVER_ERROR,
      },
    });
  }
};

export const resetData = async (req, res) => {
  try {
    const { resetTransactions, resetPaymentModes, resetCategories } = req.query;
    const userId = req.user._id;

    if (!resetTransactions && !resetPaymentModes && !resetCategories) {
      logger.error(
        `Reset account data error for user ${req.user.id}, No Reset Parameters provided`,
      );

      return res.status(500).json({
        error: {
          code: ERROR_CODES.RESET_ACCOUNT_DATA_FAILED_NO_PARAMS,
          message: ERROR.RESET_ACCOUNT_DATA_FAILED_NO_PARAMS,
        },
      });
    }

    // Reset Transactions
    if (resetTransactions === 'true') {
      await Transaction.deleteMany({ user: userId });
    }

    // Reset Payment Modes
    if (resetPaymentModes === 'true') {
      await PaymentMode.deleteMany({ user: userId });
    }

    // Reset Categories
    if (resetCategories === 'true') {
      await Category.deleteMany({ user: userId });
    }

    return res.status(200).json({ message: 'Reset completed successfully.' });
  } catch (err) {
    logger.error(`Unable to reset account data for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.RESET_ACCOUNT_DATA_FAILED,
        message: err.message,
      },
    });
  }
};
