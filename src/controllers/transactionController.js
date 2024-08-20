import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';

import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { TRANSACTION_TYPE } from '../config/contants.js';

const DEFAULT_DATE = new Date().toISOString();

export const addTransaction = async (req, res) => {
  const {
    amount, remark, category: categoryId, type, paymentMode: paymentModeId, date = DEFAULT_DATE,
  } = req.body;
  try {
    // Check if the category exists and belongs to the user
    const category = await Category.findOne({ _id: categoryId, user: req.user.id });

    if (!category) {
      logger.error(
        `Unable to add transaction for user: ${req.user.id}, category not found: ${categoryId}`,
      );
      return res.status(404).json({
        error: { code: ERROR_CODES.CATEGORY_NOT_FOUND, message: ERROR.CATEGORY_NOT_FOUND },
      });
    }

    const paymentMode = await PaymentMode.findOne({ _id: paymentModeId, user: req.user.id });

    if (!paymentMode) {
      logger.error(
        `Unable to add transaction for user: ${req.user.id},
        payment mode not found: ${paymentModeId}`,
      );
      return res.status(404).json({
        error: { code: ERROR_CODES.PAYMENT_MODE_NOT_FOUND, message: ERROR.PAYMENT_MODE_NOT_FOUND },
      });
    }

    category.expenditure += amount;

    if (type === TRANSACTION_TYPE.EXPENSE) {
      paymentMode.balance -= amount;
    } else {
      paymentMode.balance += amount;
    }

    await paymentMode.save();
    await category.save();

    const transaction = new Transaction({
      user: req.user.id,
      amount,
      remark,
      type,
      date,
      category: categoryId,
      paymentMode: paymentModeId,
    });
    await transaction.save();

    return res.status(201).json(transaction);
  } catch (err) {
    logger.error(`Unable to add transaction for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_TRANSACTION_FAILED, message: ERROR.ADD_TRANSACTION_FAILED },
    });
  }
};

export const getTransactions = async (req, res) => {
  const {
    page = 1, limit = 10, type, categories, paymentModes,
  } = req.query;

  const filter = { user: req.user.id };
  if (type) filter.type = type;
  if (categories) filter.category = { $in: categories.split(',') };
  if (paymentModes) filter.paymentMode = { $in: paymentModes.split(',') };

  try {
    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .populate('paymentMode', 'name')
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalTransactions = await Transaction.countDocuments(filter);

    return res.status(200).json({
      transactions: transactions.map((transaction) => ({
        id: transaction._id,
        amount: transaction.amount,
        remark: transaction.remark,
        date: transaction.date,
        type: transaction.type,
        category: {
          id: transaction.category?._id,
          name: transaction.category?.name,
        },
        paymentMode: {
          id: transaction.paymentMode?._id,
          name: transaction.paymentMode?.name,
        },
        updatedAt: transaction.updatedAt,
      })),
      totalTransactions,
      totalPages: Math.ceil(totalTransactions / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    logger.error(`Unable to get transactions for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.GET_TRANSACTION_FAILED, message: ERROR.GET_TRANSACTION_FAILED },
    });
  }
};

export const updateTransaction = async (req, res) => {
  const { id } = req.params;
  const {
    amount, remark, category: newCategoryId, type,
    paymentMode: newPaymentModeId, date = DEFAULT_DATE,
  } = req.body;
  const user = req.user.id;
  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      logger.error(
        `Unable to update transactions for user: ${user},
        Error: Transaction ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
        },
      });
    }
    if (transaction.user.toString() !== user) {
      logger.error(
        `Unable to update transaction ${id}, Error: user ${user} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    }

    const newCategory = await Category.findOne({ _id: newCategoryId, user });
    if (!newCategory) {
      logger.error(
        `Unable to update transaction for user: ${user},
        category not found: ${newCategoryId}`,
      );
      return res.status(404).json({
        error: { code: ERROR_CODES.CATEGORY_NOT_FOUND, message: ERROR.CATEGORY_NOT_FOUND },
      });
    }
    const newPaymentMode = await PaymentMode.findOne({ _id: newPaymentModeId, user });
    if (!newPaymentMode) {
      logger.error(
        `Unable to update transaction for user: ${user},
        payment mode not found: ${newPaymentModeId}`,
      );
      return res.status(404).json({
        error: { code: ERROR_CODES.PAYMENT_MODE_NOT_FOUND, message: ERROR.PAYMENT_MODE_NOT_FOUND },
      });
    }

    const oldCategory = await Category.findOne({ _id: transaction.category, user });
    const oldPaymentMode = await PaymentMode.findOne({ _id: transaction.paymentMode, user });

    // Revert old transaction effects
    oldCategory.expenditure -= transaction.amount;
    if (transaction.type === 'income') {
      oldPaymentMode.balance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      oldPaymentMode.balance += transaction.amount;
    }

    // Apply new transaction effects
    newCategory.expenditure += amount;
    if (type === 'income') {
      newPaymentMode.balance += amount;
    } else if (type === 'expense') {
      newPaymentMode.balance -= amount;
    }

    // Save the updated payment modes and categories
    await oldPaymentMode.save();
    await oldCategory.save();
    await newPaymentMode.save();
    await newCategory.save();

    transaction.amount = amount;
    transaction.remark = remark;
    transaction.type = type;
    transaction.category = newCategoryId;
    transaction.paymentMode = newPaymentModeId;
    transaction.date = date;

    await transaction.save();

    return res.status(200).json(transaction);
  } catch (err) {
    logger.error(`Unable to update transaction ${id} for user ${user}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.UPDATE_TRANSACTION_FAILED,
        message: ERROR.UPDATE_TRANSACTION_FAILED,
      },
    });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const user = req.user.id;

  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      logger.error(
        `Unable to delete transaction ${id} for user ${user},
        Error: Transaction ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,

        },
      });
    }
    if (transaction.user.toString() !== user) {
      logger.error(
        `Unable to delete transaction ${id}, Error: user ${user} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    }

    const paymentMode = await PaymentMode.findOne({ _id: transaction.paymentMode, user });
    const category = await Category.findOne({ _id: transaction.category, user });

    // Revert the transaction effects on payment mode and category
    category.expenditure -= transaction.amount;
    if (transaction.type === 'income') {
      paymentMode.balance -= transaction.amount;
    } else if (transaction.type === 'expense') {
      paymentMode.balance += transaction.amount;
    }

    // Save the updated payment mode and category
    await paymentMode.save();
    await category.save();

    // Delete the transaction
    await transaction.deleteOne();
    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    logger.error(`Unable to update transaction ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.DELETE_TRANSACTION_FAILED,
        message: ERROR.DELETE_TRANSACTION_FAILED,
      },
    });
  }
};
