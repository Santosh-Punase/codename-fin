import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';

import User from '../models/User.js';

import { JWT_SECRET, JWT_EXPIRY, GOOGLE_CLIENT_ID } from '../config/env.js';
import logger from '../utils/logger.js';
import { ERROR_CODES, VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { ERROR, VALIDATION_ERROR } from '../const/errorMessages.js';
import {
  initialiseWithDefaultCategories,
  initialiseWithDefaultPaymentModes,
} from '../utils/user.js';

const client = new OAuth2Client(GOOGLE_CLIENT_ID);

const getToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRY });

export const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const user = new User({ username, email, password });
    await user.save();

    // Create default categories
    await initialiseWithDefaultCategories(user._id);

    // Create default payment modes
    await initialiseWithDefaultPaymentModes(user._id);

    const token = getToken(user._id);
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
    if (!user || !user.password || !await user.matchPassword(password)) {
      return res.status(401)
        .json({
          error: {
            code: ERROR_CODES.INVALID_CREDENTIALS, message: ERROR.INVALID_CREDENTIALS,
          },
        });
    }
    const token = getToken(user._id);
    return res.status(200).json({ token });
  } catch (err) {
    logger.error(`Unable to Login a user ${email}: ${err}`);
    return res.status(500).json({ error: { code: err.code, message: err.message } });
  }
};

export const getUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId).select(
      ['username', 'email', 'currency', 'gender', 'birthDate', 'picture'],
    );
    if (!user) {
      return res.status(404).json({
        error: {
          code: ERROR_CODES.USER_NOT_FOUND, message: ERROR.USER_NOT_FOUND,
        },
      });
    }

    return res.json({
      username: user.username,
      email: user.email,
      currency: user.currency,
      gender: user.gender,
      picture: user.picture,
      birthDate: user.birthDate,
    });
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
    const {
      username, password, currency, gender, birthDate,
    } = req.body;

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
    if (password) {
      if (password.length < 6 || password.length > 12) {
        return res.status(404).json({
          error: {
            code: VALIDATION_ERROR_CODES.INVALID_PASSWORD_LENGTH,
            message: VALIDATION_ERROR.INVALID_PASSWORD_LENGTH,
          },
        });
      }
      user.password = password;
    }
    if (currency) user.currency = currency;
    if (gender) user.gender = gender;
    if (birthDate) user.birthDate = birthDate;

    await user.save();
    return res.json({
      username: user.username,
      email: user.email,
      gender: user.gender,
      birthDate: user.birthDate,
      currency: user.currency,
      googleId: user.googleId,
      picture: user.picture,
    });
  } catch (err) {
    return res.status(500).json({
      error: {
        code: ERROR_CODES.SERVER_ERROR, message: ERROR.SERVER_ERROR,
      },
    });
  }
};

export const googleSignin = async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    return res.status(400)
      .json({
        error: {
          code: VALIDATION_ERROR_CODES.DEFAULT, message: VALIDATION_ERROR.DEFAULT,
        },
      });
  }
  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: googleId, email } = payload;

    // Check if the user already exists in your database
    const userWithGoogle = await User.findOne({ googleId }); // Unique Google user ID
    const userWithEmail = await User.findOne({ email }); // Unique email
    let user;
    let isNewUser = false;

    if (!userWithGoogle) {
      if (userWithEmail) {
        userWithEmail.googleId = googleId;
        userWithEmail.picture = payload.picture;
        await userWithEmail.save();
        user = userWithEmail;
      } else {
        isNewUser = true;
        // User does not exist: Create a new user (Sign-Up)
        user = await User.create({
          googleId,
          email,
          username: payload.given_name,
          picture: payload.picture,
        });

        // Create default categories
        await initialiseWithDefaultCategories(user._id);

        // Create default payment modes
        await initialiseWithDefaultPaymentModes(user._id);
      }
    } else {
      user = userWithGoogle;
    }

    // Generate a JWT for the user (Sign-In or Sign-Up)
    const token = getToken(user._id);

    return res.status(200).json({
      token, isNewUser, email, username: user.username,
    });
  } catch (error) {
    console.error('Error during Google authentication:', error);
    return res.status(401).json({ error: 'Invalid Google token' });
  }
};
