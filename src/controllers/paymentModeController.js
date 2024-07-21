import PaymentMode from '../models/PaymentMode.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';

export const addPaymentMode = async (req, res) => {
  const { name } = req.body;
  try {
    const pMode = new PaymentMode({
      user: req.user.id,
      name,
    });
    await pMode.save();
    return res.status(201).json(pMode);
  } catch (err) {
    logger.error(`Unable to add payment mode for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_PAYMENT_MODE_FAILED, message: ERROR.ADD_PAYMENT_MODE_FAILED },
    });
  }
};

export const getPaymentModes = async (req, res) => {
  try {
    const pModes = await PaymentMode.find({ user: req.user.id });
    return res.status(200).json(pModes);
  } catch (err) {
    logger.error(`Unable to get payment modes for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.GET_PAYMENT_MODE_FAILED, message: ERROR.GET_PAYMENT_MODE_FAILED },
    });
  }
};

export const updatePaymentMode = async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;
  try {
    const pMode = await PaymentMode.findById(id);

    if (!pMode) {
      logger.error(
        `Unable to update payment mode for user: ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_PAYMENT_MODE_DOES_NOT_EXIST,
        },
      });
    }
    if (pMode.user.toString() !== req.user.id) {
      logger.error(
        `Unable to update payment mode ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_PAYMENT_MODE_UNAUTHORIZED,
        },
      });
    }

    pMode.name = name;
    await pMode.save();
    return res.status(200).json(pMode);
  } catch (err) {
    logger.error(`Unable to update payment mode ${id} for user ${req.user.id}, ${err}`);
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
