import express from 'express';

import {
  addTransaction, getTransactions, updateTransaction, deleteTransaction,
} from '../controllers/transactionController.js';
import protect from '../middleware/authMiddleware.js';
import {
  transactionValidationRules,
  validateTransaction,
} from '../middleware/transactionValidator.js';

const router = express.Router();

router.post('/', protect, transactionValidationRules, validateTransaction, addTransaction);
router.get('/', protect, getTransactions);
router.put('/:id', protect, transactionValidationRules, validateTransaction, updateTransaction);
router.delete('/:id', protect, deleteTransaction);

export default router;
