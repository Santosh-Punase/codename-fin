import express from 'express';

import { register, login } from '../controllers/authController.js';
import { userValidationRules, validateUser } from '../middleware/userValidator.js';

const router = express.Router();

router.post('/register', userValidationRules, validateUser, register);
router.post('/login', login);

export default router;
