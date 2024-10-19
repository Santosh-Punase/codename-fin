import Transaction from '../models/Transaction.js';

import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { getTransactionDateFilters } from '../utils/index.js';
import {
  validatePaymentMode,
  updatePaymentModeAmount,
  revertPaymentModeAmount,
  substractPaymentModeAmount,
  addPaymentModeAmount,
} from '../utils/paymentMode.js';
import {
  createTransaction,
  transactionContainsCategory,
  transactionErrorResponse,
  validateTransaction,
} from '../utils/transaction.js';
import { validateCategory, updateCategoryAmount } from '../utils/category.js';
import { TRANSACTION_TYPE } from '../config/contants.js';

const DEFAULT_DATE = new Date().toISOString();

export const addTransaction = async (req, res) => {
  const {
    amount, remark, category: categoryId, type, paymentMode: paymentModeId,
    transferTo: transferToId, date = DEFAULT_DATE,
  } = req.body;
  const userId = req.user.id;

  try {
    const [paymentMode, bankAccount] = await validatePaymentMode(paymentModeId, userId);
    const response = {};
    if (type === TRANSACTION_TYPE.TRANSFER) {
      const [
        transferToPaymentMode, transferToBankAccount,
      ] = await validatePaymentMode(transferToId, userId);

      await addPaymentModeAmount(transferToPaymentMode, amount, transferToBankAccount);
      await substractPaymentModeAmount(paymentMode, amount, bankAccount);

      response.transferTo = transferToPaymentMode.name;
    } else {
      const category = await validateCategory(categoryId, userId);
      await updateCategoryAmount(category, amount);

      await updatePaymentModeAmount(paymentMode, type, amount, bankAccount);
      response.category = category.name;
    }

    const transaction = await createTransaction({
      userId, amount, remark, type, date, categoryId, paymentModeId, transferToId,
    });

    return res.status(201).json({
      ...transaction,
      ...response,
      paymentMode: paymentMode.name,
    });
  } catch (err) {
    const {
      statusCode,
      errorCode,
      errorMessage,
    } = transactionErrorResponse(err.message, 'ADD_TRANSACTION_FAILED');

    logger.error(`Unable to add transaction for user: ${userId}, ${err}`);
    return res.status(statusCode).json({
      error: { code: errorCode, message: errorMessage },
    });
  }
};

export const getTransactions = async (req, res) => {
  const {
    page = 1, limit = 10, type, categories, paymentModes, period, startDate, endDate,
  } = req.query;

  const filter = { user: req.user.id };
  if (type) filter.type = type;
  if (categories) filter.category = { $in: categories.split(',') };
  if (paymentModes) filter.paymentMode = { $in: paymentModes.split(',') };

  const dateFilter = getTransactionDateFilters(period, startDate, endDate);
  if (Object.keys(dateFilter).length) {
    filter.date = dateFilter;
  }

  try {
    const transactions = await Transaction.find(filter)
      .populate('category', 'name')
      .populate('paymentMode', 'name')
      .populate('transferTo', 'name')
      .sort({ date: -1 })
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
        transferTo: {
          id: transaction.transferTo?._id,
          name: transaction.transferTo?.name,
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
    paymentMode: newPaymentModeId, transferTo: newTransferToId, date,
  } = req.body;
  const userId = req.user.id;
  try {
    const transaction = await validateTransaction(id, userId);
    const {
      category: oldCategoryId,
      paymentMode: oldPaymentModeId,
      transferTo: oldTransferToId,
      type: oldType,
      amount: oldAmount,
    } = transaction;
    let updatedCategoryId = oldCategoryId;
    let updatedPaymentModeId = oldPaymentModeId;
    let updatedTransferToId = oldTransferToId;

    const oldTrHasCat = transactionContainsCategory(oldType);
    const newTrHasCat = transactionContainsCategory(type);

    if (oldTrHasCat && newTrHasCat) {
      if (!oldCategoryId.equals(newCategoryId)) {
        const oldCategory = await validateCategory(oldCategoryId, userId);
        const newCategory = await validateCategory(newCategoryId, userId);

        await updateCategoryAmount(oldCategory, -oldAmount);
        await updateCategoryAmount(newCategory, amount);
        updatedCategoryId = newCategoryId;
      } else if (oldAmount !== amount) {
        const oldCategory = await validateCategory(oldCategoryId, userId);

        await updateCategoryAmount(oldCategory, -oldAmount + amount);
      }
    } else if (oldTrHasCat) {
      // Non transfer to transfer
      const oldCategory = await validateCategory(oldCategoryId, userId);
      const [newPaymentMode, newBankAccount] = await validatePaymentMode(newTransferToId, userId);

      await updateCategoryAmount(oldCategory, -oldAmount);
      await addPaymentModeAmount(newPaymentMode, amount, newBankAccount);
      updatedCategoryId = null;
      updatedTransferToId = newTransferToId;
    } else if (newTrHasCat) {
      // transfer to Non transfer
      const newCategory = await validateCategory(newCategoryId, userId);
      const [oldTransferTo, oldBankAccount] = await validatePaymentMode(oldTransferToId, userId);

      await updateCategoryAmount(newCategory, amount);
      await substractPaymentModeAmount(oldTransferTo, oldAmount, oldBankAccount);
      updatedTransferToId = null;
      updatedCategoryId = newCategoryId;
    } else if (!oldTransferToId.equals(newTransferToId)) {
      const [oldTransferTo, oldBankAccount] = await validatePaymentMode(oldTransferToId, userId);
      const [newTransferTo, newBankAccount] = await validatePaymentMode(newTransferToId, userId);

      await substractPaymentModeAmount(oldTransferTo, oldAmount, oldBankAccount);
      await addPaymentModeAmount(newTransferTo, amount, newBankAccount);
      updatedTransferToId = newTransferToId;
    } else if (oldAmount !== amount) {
      const [oldTransferTo, oldBankAccount] = await validatePaymentMode(oldTransferToId, userId);

      await addPaymentModeAmount(oldTransferTo, amount - oldAmount, oldBankAccount);
    }

    // Revert old transaction effects on category and apply new transaction effects
    // if (!oldCategoryId.equals(newCategoryId) || oldType !== type) {
    //   const oldCategory = await validateCategory(oldCategoryId, userId);
    //   const newCategory = await validateCategory(newCategoryId, userId);

    //   await updateCategoryAmount(oldCategory, -oldAmount);
    //   await updateCategoryAmount(newCategory, amount);
    //   updatedCategoryId = newCategoryId;
    // } else if (oldAmount !== amount) {
    //   const oldCategory = await validateCategory(oldCategoryId, userId);

    //   await updateCategoryAmount(oldCategory, -oldAmount + amount);
    // }

    // Revert old transaction effects on payment mode and apply new transaction effects
    if (!oldPaymentModeId.equals(newPaymentModeId)) {
      const [oldPaymentMode, oldBankAccount] = await validatePaymentMode(oldPaymentModeId, userId);
      const [newPaymentMode, newBankAccount] = await validatePaymentMode(newPaymentModeId, userId);

      await revertPaymentModeAmount(oldPaymentMode, oldType, oldAmount, oldBankAccount);
      await updatePaymentModeAmount(newPaymentMode, type, amount, newBankAccount);
      updatedPaymentModeId = newPaymentModeId;
      // } else if (oldAmount !== amount || oldType !== type) {
    } else if (oldAmount !== amount) {
      const [oldPaymentMode, oldBankAccount] = await validatePaymentMode(oldPaymentModeId, userId);

      await updatePaymentModeAmount(oldPaymentMode, type, amount - oldAmount, oldBankAccount);
    }

    transaction.amount = amount;
    transaction.remark = remark;
    transaction.type = type;
    transaction.category = updatedCategoryId;
    transaction.paymentMode = updatedPaymentModeId;
    transaction.transferTo = updatedTransferToId;
    transaction.date = date;

    await transaction.save();

    return res.status(200).json(transaction);
  } catch (err) {
    const {
      statusCode,
      errorCode,
      errorMessage,
    } = transactionErrorResponse(err.message, 'UPDATE_TRANSACTION_FAILED');

    logger.error(`Unable to update transaction ${id} for user ${userId}, ${err}`);
    return res.status(statusCode).json({
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
};

export const deleteTransaction = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const transaction = await validateTransaction(id, userId);

    const {
      category: categoryId, paymentMode: paymentModeId, transferTo: transferToId, type, amount,
    } = transaction;
    const [paymentMode, bankAccount] = await validatePaymentMode(paymentModeId, userId);
    if (type === TRANSACTION_TYPE.TRANSFER) {
      const [transferTo, transferToBankAccount] = await validatePaymentMode(transferToId, userId);
      await substractPaymentModeAmount(transferTo, amount, transferToBankAccount);
    } else {
      const category = await validateCategory(categoryId, userId);

      // Revert the transaction effects on payment mode and category
      await updateCategoryAmount(category, -transaction.amount);
    }
    await revertPaymentModeAmount(paymentMode, type, amount, bankAccount);

    // Delete the transaction
    await transaction.deleteOne();
    return res.status(200).json({ message: 'Transaction deleted' });
  } catch (err) {
    const {
      statusCode,
      errorCode,
      errorMessage,
    } = transactionErrorResponse(err.message, 'DELETE_TRANSACTION_FAILED');

    logger.error(`Unable to delete transaction ${id} for user ${userId}, ${err}`);
    return res.status(statusCode).json({
      error: {
        code: errorCode,
        message: errorMessage,
      },
    });
  }
};
