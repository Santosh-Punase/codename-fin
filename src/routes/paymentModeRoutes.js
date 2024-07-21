import express from 'express';

import {
  addPaymentMode, getPaymentModes, updatePaymentMode, deletePaymentMode,
} from '../controllers/paymentModeController.js';
import protect from '../middleware/authMiddleware.js';
import {
  paymentModeValidationRules,
  validatePaymentMode,
} from '../middleware/paymentModeValidator.js';

const router = express.Router();

router.post('/', protect, paymentModeValidationRules, validatePaymentMode, addPaymentMode);
router.get('/', protect, getPaymentModes);
router.put('/:id', protect, paymentModeValidationRules, validatePaymentMode, updatePaymentMode);
router.delete('/:id', protect, deletePaymentMode);

export default router;
