import BankAccount from '../models/BankAccount.js';

import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';

export const addBankAccount = async (req, res) => {
  const { name, balance } = req.body;
  try {
    const bankAccount = new BankAccount({
      user: req.user.id,
      name,
      balance,
    });
    await bankAccount.save();
    return res.status(201).json(bankAccount);
  } catch (err) {
    logger.error(`Unable to add bank account for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_BANK_ACCOUNT_FAILED, message: ERROR.ADD_BANK_ACCOUNT_FAILED },
    });
  }
};

export const getBankAccounts = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const matchCondition = { user: req.user._id };

    const bankAccount = await BankAccount.find(matchCondition)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalBankAccounts = await BankAccount.countDocuments(matchCondition);

    return res.status(200).json({
      bankAccounts: bankAccount.map((acc) => ({
        id: acc._id,
        name: acc.name,
        balance: acc.balance,
        updatedAt: acc.updatedAt,
      })),
      totalBankAccounts,
      totalPages: Math.ceil(totalBankAccounts / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    logger.error(`Unable to get bank accounts for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.GET_BANK_ACCOUNT_FAILED, message: ERROR.GET_BANK_ACCOUNT_FAILED },
    });
  }
};

export const updateBankAccount = async (req, res) => {
  const { id } = req.params;
  const { name, balance } = req.body;
  try {
    const bankAccount = await BankAccount.findById(id);

    if (!bankAccount) {
      logger.error(
        `Unable to update bank account for user: ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST,
        },
      });
    }
    if (bankAccount.user.toString() !== req.user.id) {
      logger.error(
        `Unable to update bank account ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_BANK_ACCOUNT_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_BANK_ACCOUNT_UNAUTHORIZED,
        },
      });
    }

    bankAccount.name = name;
    bankAccount.balance = balance;
    await bankAccount.save();
    return res.status(200).json(bankAccount);
  } catch (err) {
    logger.error(`Unable to update bank account ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.UPDATE_BANK_ACCOUNT_FAILED,
        message: ERROR.UPDATE_BANK_ACCOUNT_FAILED,
      },
    });
  }
};

export const deleteBankAccount = async (req, res) => {
  const { id } = req.params;
  try {
    const bankAccount = await BankAccount.findById(id);
    if (!bankAccount) {
      logger.error(
        `Unable to delete bank account ${id} for user ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_BANK_ACCOUNT_DOES_NOT_EXIST,

        },
      });
    }
    if (bankAccount.user.toString() !== req.user.id) {
      logger.error(
        `Unable to delete bank account ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_BANK_ACCOUNT_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_BANK_ACCOUNT_UNAUTHORIZED,
        },
      });
    }
    await bankAccount.deleteOne();
    return res.status(200).json({ message: 'Bank account deleted' });
  } catch (err) {
    logger.error(`Unable to delete bank account ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.DELETE_BANK_ACCOUNT_FAILED,
        message: ERROR.DELETE_BANK_ACCOUNT_FAILED,
      },
    });
  }
};
