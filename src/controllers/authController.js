import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import Category from '../models/Category.js';
import PaymentMode from '../models/PaymentMode.js';

import { JWT_SECRET, JWT_EXPIRY } from '../config/env.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { defaultCategories, defaultPaymentModes } from '../utils/seed.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();

    // Create default categories
    const categories = defaultCategories.map((category) => ({ ...category, user: user._id }));
    await Category.insertMany(categories);

    // Create default payment modes
    const paymentModes = defaultPaymentModes.map((mode) => ({ ...mode, user: user._id }));
    await PaymentMode.insertMany(paymentModes);

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY || '1h' });
    logger.info(`New user created ${email}`);
    return res.status(201).json({ token });
  } catch (err) {
    logger.error(`Unable to register a user ${email}: ${err}`);
    return res.status(500).json({ error: { code: err.code, message: err.message } });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401)
        .json({
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS, message: ERROR.INVALID_CREDENTIALS,
          },
        });
    }
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY || '1h' });
    return res.status(200).json({ token });
  } catch (err) {
    logger.error(`Unable to Login a user ${email}: ${err}`);
    return res.status(500).json({ error: { code: err.code, message: err.message } });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(['username', 'email', 'currency']);
    if (!user) {
      return res.status(404).json({
        error: {
          code: ERROR_CODES.USER_NOT_FOUND, message: ERROR.USER_NOT_FOUND,
        },
      });
    }
    return res.json({ username: user.username, email: user.email, currency: user.currency });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: ERROR_CODES.SERVER_ERROR, message: ERROR.SERVER_ERROR,
      },
    });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const { username, password, currency } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        error: {
          code: ERROR_CODES.USER_NOT_FOUND, message: ERROR.USER_NOT_FOUND,
        },
      });
    }

    // Update user fields
    if (username) user.username = username;
    if (password) user.password = password;
    if (currency) user.currency = currency;

    await user.save();
    return res.json({ username: user.username, email: user.email, currency: user.currency });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: ERROR_CODES.SERVER_ERROR, message: ERROR.SERVER_ERROR,
      },
    });
  }
};
