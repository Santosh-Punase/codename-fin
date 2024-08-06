import express from 'express';

import { getAccountSummary } from '../controllers/accountController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getAccountSummary);

export default router;
