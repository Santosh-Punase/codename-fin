import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { JWT_SECRET, JWT_EXPIRY } from '../config/env.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();
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
    const user = await User.findById(userId).select(['username', 'email']);
    if (!user) {
      return res.status(404).json({
        error: {
          code: ERROR_CODES.USER_NOT_FOUND, message: ERROR.USER_NOT_FOUND,
        },
      });
    }
    return res.json({ username: user.username, email: user.email });
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
    const { username, password } = req.body;

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

    await user.save();
    return res.json({ username: user.username, email: user.email });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: ERROR_CODES.SERVER_ERROR, message: ERROR.SERVER_ERROR,
      },
    });
  }
};
