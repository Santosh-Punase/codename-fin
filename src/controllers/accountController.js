import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';
import User from '../models/User.js';

import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { TRANSACTION_TYPE } from '../config/contants.js';
import {
  deleteAllCategories,
  deleteAllPaymentModes,
  initialiseWithDefaultCategories,
  initialiseWithDefaultPaymentModes, resetCategoriesExpenditure,
} from '../utils/user.js';

export const getAccountSummary = async (req, res) => {
  try {
    const userId = req.user._id;

    const transactions = await Transaction.aggregate([
      { $match: { user: userId } },
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
      if (transaction._id === TRANSACTION_TYPE.INCOME) {
        totalIncome = transaction.total;
      } else if (transaction._id === TRANSACTION_TYPE.EXPENSE) {
        totalExpense = transaction.total;
      }
    });

    const categories = await Category.aggregate([
      { $match: { user: userId } },
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
  const userId = req.user._id;
  try {
    const { resetTransactions, resetPaymentModes, resetCategories } = req.query;

    if (!resetTransactions && !resetPaymentModes && !resetCategories) {
      logger.error(
        `Reset account data error for user ${userId}, No Reset Parameters provided`,
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
      await deleteAllPaymentModes(userId);

      // Insert default payment modes
      await initialiseWithDefaultPaymentModes(userId);
    }

    // Reset Categories
    if (resetCategories === 'true') {
      await deleteAllCategories(userId);

      // Insert default categories
      await initialiseWithDefaultCategories(userId);
    } else {
      // Reset expenditure to 0 for all categories if resetCategories is not provided
      await resetCategoriesExpenditure(userId);
    }

    return res.status(200).json({ message: 'Reset completed successfully.' });
  } catch (err) {
    logger.error(`Unable to reset account data for user ${userId}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.RESET_ACCOUNT_DATA_FAILED,
        message: err.message,
      },
    });
  }
};

export const deleteAccount = async (req, res) => {
  const userId = req.user._id;
  const { reasons = [], additionalComment = '' } = req.body;
  try {
    await Transaction.deleteMany({ user: userId });
    await deleteAllPaymentModes(userId);
    await deleteAllCategories(userId);
    // await User.findByIdAndDelete(userId);
    const user = await User.findById(userId);
    user.reasons = `${reasons.join(',')} ${additionalComment}`;

    await user.save();

    return res.status(200).json({ message: 'Account deleted successfully.' });
  } catch (err) {
    logger.error(`Unable to delete account for user ${userId}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.DELETE_ACCOUNT_FAILED,
        message: ERROR.DELETE_ACCOUNT_FAILED,
      },
    });
  }
};
