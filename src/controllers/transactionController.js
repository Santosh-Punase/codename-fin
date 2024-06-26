import Transaction from '../models/Transaction.js';
import Category from '../models/Category.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { TRANSACTION_TYPE } from '../config/contants.js';

const DEFAULT_DATE = new Date().toISOString();

export const addTransaction = async (req, res) => {
  const {
    amount, remark, category, type, date = DEFAULT_DATE,
  } = req.body;
  try {
    // Check if the category exists and belongs to the user
    const _category = await Category.findOne({ _id: category, user: req.user.id });

    if (!_category) {
      logger.error(
        `Unable to add transaction for user: ${req.user.id}, category not found: ${category}`,
      );
      return res.status(404).json({
        error: { code: ERROR_CODES.CATEGORY_NOT_FOUND, message: ERROR.CATEGORY_NOT_FOUND },
      });
    }
    const transaction = new Transaction({
      user: req.user.id,
      amount,
      remark,
      type,
      category,
      date,
    });
    await transaction.save();

    _category.expenditure += type === TRANSACTION_TYPE.EXPENSE ? amount : -amount;
    await _category.save();

    return res.status(201).json(transaction);
  } catch (err) {
    logger.error(`Unable to add transaction for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_TRANSACTION_FAILED, message: ERROR.ADD_TRANSACTION_FAILED },
    });
  }
};

export const getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    return res.status(200).json(transactions);
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
    amount, remark, category, type, date = DEFAULT_DATE,
  } = req.body;
  try {
    const transaction = await Transaction.findById(id);

    if (!transaction) {
      logger.error(
        `Unable to update transactions for user: ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
        },
      });
    }
    if (transaction.user.toString() !== req.user.id) {
      logger.error(
        `Unable to update transaction ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    }

    // Revert the old transaction's effect on the category's expenditure
    const oldCategory = await Category.findById(transaction.category);
    oldCategory.expenditure
      -= transaction.type === TRANSACTION_TYPE.EXPENSE ? transaction.amount : -transaction.amount;
    await oldCategory.save();

    transaction.amount = amount;
    transaction.remark = remark;
    transaction.type = type;
    transaction.category = category;
    transaction.date = date;
    await transaction.save();

    // Apply the new transaction's effect on the category's expenditure
    const newCategory = await Category.findById(category);
    newCategory.expenditure += type === TRANSACTION_TYPE.EXPENSE ? amount : -amount;
    await newCategory.save();

    return res.status(200).json(transaction);
  } catch (err) {
    logger.error(`Unable to update transaction ${id} for user ${req.user.id}, ${err}`);
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
  try {
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      logger.error(
        `Unable to delete transaction ${id} for user ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,

        },
      });
    }
    if (transaction.user.toString() !== req.user.id) {
      logger.error(
        `Unable to delete transaction ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    }

    // Revert the transaction's effect on the category's expenditure
    const category = await Category.findById(transaction.category);
    category.expenditure
      -= transaction.type === TRANSACTION_TYPE.EXPENSE ? transaction.amount : -transaction.amount;
    await category.save();

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
