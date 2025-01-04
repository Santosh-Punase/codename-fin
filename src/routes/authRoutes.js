import express from 'express';

import {
  register, login, getUser, updateUser,
  googleSignin,
} from '../controllers/authController.js';
import {
  userValidationRules,
  validateUser,
} from '../middleware/userValidator.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google', googleSignin);

router.post('/register', userValidationRules, validateUser, register);
router.post('/login', login);

router.get('/me', protect, getUser);
router.patch('/user', protect, updateUser);

export default router;
