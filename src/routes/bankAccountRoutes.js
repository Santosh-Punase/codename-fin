import express from 'express';

import {
  addBankAccount, getBankAccounts, updateBankAccount, deleteBankAccount,
} from '../controllers/bankAccountController.js';
import protect from '../middleware/authMiddleware.js';
import {
  bankAccountValidationRules,
  validateBankAccount,
} from '../middleware/bankAccountValidator.js';

const router = express.Router();

router.post('/', protect, bankAccountValidationRules, validateBankAccount, addBankAccount);
router.get('/', protect, getBankAccounts);
router.put('/:id', protect, bankAccountValidationRules, validateBankAccount, updateBankAccount);
router.delete('/:id', protect, deleteBankAccount);

export default router;
