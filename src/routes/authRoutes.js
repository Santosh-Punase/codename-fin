import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';

import {
  register, login, getUser, updateUser,
} from '../controllers/authController.js';
import {
  userValidationRules,
  validateUser,
} from '../middleware/userValidator.js';
import protect from '../middleware/authMiddleware.js';
import {
  CALLBACK_URL,
  GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, JWT_EXPIRY, JWT_SECRET,
} from '../config/env.js';

const router = express.Router();

passport.use(
  new GoogleStrategy(
    {
      clientID: GOOGLE_CLIENT_ID,
      clientSecret: GOOGLE_CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      console.log('accessToken', accessToken);
      console.log('profile', profile);
      // Process user profile and save in DB or return the user object
      done(null, profile);
    },
  ),
);

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((obj, done) => done(null, obj));

router.get(
  '/google',
  passport.authenticate('google', { scope: ['profile', 'email'] }),
);

router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    // Generate JWT token
    const token = jwt.sign({ id: req.user.id }, JWT_SECRET, {
      expiresIn: JWT_EXPIRY,
    });
    res.json({ token, user: req.user });
  },
);

router.post('/register', userValidationRules, validateUser, register);
router.post('/login', login);

router.get('/me', protect, getUser);
router.patch('/user', protect, updateUser);

export default router;
