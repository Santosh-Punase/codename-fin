import express from 'express';

import { deleteAccount, getAccountSummary, resetData } from '../controllers/accountController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, getAccountSummary);
router.post('/reset', protect, resetData);
router.post('/delete-account', protect, deleteAccount);

export default router;
