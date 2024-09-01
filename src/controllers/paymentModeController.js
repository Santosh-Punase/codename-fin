import PaymentMode from '../models/PaymentMode.js';
import BankAccount from '../models/BankAccount.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { isBankLinkedPaymentMode } from '../utils/paymentMode.js';

export const addPaymentMode = async (req, res) => {
  const {
    name, type, balance, bankAccount,
  } = req.body;
  const userId = req.user.id;
  const mode = { user: userId, name, type };
  try {
    if (isBankLinkedPaymentMode(type)) {
      const account = await BankAccount.findOne({ _id: bankAccount, user: userId });

      if (!account) {
        logger.error(
          `Unable to add payment mode for user: ${userId},
          bank account not found: ${bankAccount}`,
        );
        return res.status(404).json({
          error: {
            code: ERROR_CODES.BANK_ACCOUNT_NOT_FOUND,
            message: ERROR.BANK_ACCOUNT_NOT_FOUND,
          },
        });
      }
      const pMode = new PaymentMode({ ...mode, bankAccount });
      await pMode.save();
      return res.status(201).json(pMode);
    }
    const pMode = new PaymentMode({ ...mode, balance });
    await pMode.save();
    return res.status(201).json(pMode);
  } catch (err) {
    logger.error(`Unable to add payment mode for user: ${userId}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_PAYMENT_MODE_FAILED, message: ERROR.ADD_PAYMENT_MODE_FAILED },
    });
  }
};

export const getPaymentModes = async (req, res) => {
  const { page = 1, limit = 20, type } = req.query;

  try {
    const matchCondition = { user: req.user._id };
    if (type) matchCondition.type = type; // Filter by type if provided

    const pModes = await PaymentMode.find(matchCondition)
      .populate('bankAccount', ['name', 'balance'])
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalPaymentModes = await PaymentMode.countDocuments(matchCondition);

    return res.status(200).json({
      paymentModes: pModes.map((pMode) => {
        const balanceDetails = isBankLinkedPaymentMode(pMode.type) ? ({
          bankAccount: {
            id: pMode.bankAccount?._id,
            name: pMode.bankAccount?.name,
            balance: pMode.bankAccount?.balance,
          },
        }) : { balance: pMode.balance };

        return {
          id: pMode._id,
          name: pMode.name,
          type: pMode.type,
          ...balanceDetails,
          updatedAt: pMode.updatedAt,
        };
      }),
      totalPaymentModes,
      totalPages: Math.ceil(totalPaymentModes / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    logger.error(`Unable to get payment modes for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.GET_PAYMENT_MODE_FAILED, message: ERROR.GET_PAYMENT_MODE_FAILED },
    });
  }
};

export const updatePaymentMode = async (req, res) => {
  const { id } = req.params;
  const {
    name, type, balance, bankAccount,
  } = req.body;
  const userId = req.user.id;
  try {
    const pMode = await PaymentMode.findById(id);

    if (!pMode) {
      logger.error(
        `Unable to update payment mode for user: ${userId}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,
        },
      });
    }
    if (pMode.user.toString() !== userId) {
      logger.error(
        `Unable to update payment mode ${id}, Error: user ${userId} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
        },
      });
    }
    if (bankAccount) {
      const account = await BankAccount.findOne({ _id: bankAccount, user: userId });
      if (!account) {
        logger.error(
          `Unable to update payment mode for user: ${userId},
          bank account not found: ${bankAccount}`,
        );
        return res.status(404).json({
          error: {
            code: ERROR_CODES.BANK_ACCOUNT_NOT_FOUND,
            message: ERROR.BANK_ACCOUNT_NOT_FOUND,
          },
        });
      }
      pMode.bankAccount = bankAccount;
      pMode.balance = 0;
    } else {
      pMode.bankAccount = null;
      pMode.balance = balance;
    }
    pMode.name = name;
    pMode.type = type;
    await pMode.save();
    return res.status(200).json(pMode);
  } catch (err) {
    logger.error(`Unable to update payment mode ${id} for user ${userId}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.UPDATE_PAYMENT_MODE_FAILED,
        message: ERROR.UPDATE_PAYMENT_MODE_FAILED,
      },
    });
  }
};

export const deletePaymentMode = async (req, res) => {
  const { id } = req.params;
  try {
    const pMode = await PaymentMode.findById(id);
    if (!pMode) {
      logger.error(
        `Unable to delete payment mode ${id} for user ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,

        },
      });
    }
    if (pMode.user.toString() !== req.user.id) {
      logger.error(
        `Unable to delete payment mode ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
        },
      });
    }
    await pMode.deleteOne();
    return res.status(200).json({ message: 'Payment mode deleted' });
  } catch (err) {
    logger.error(`Unable to delete payment mode ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.DELETE_PAYMENT_MODE_FAILED,
        message: ERROR.DELETE_PAYMENT_MODE_FAILED,
      },
    });
  }
};
