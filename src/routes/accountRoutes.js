import express from 'express';

import { getAccountSummary, resetData } from '../controllers/accountController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', protect, getAccountSummary);
router.post('/reset', protect, resetData);

export default router;
