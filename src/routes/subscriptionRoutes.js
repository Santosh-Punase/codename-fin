import express from 'express';

import validateSubscription from '../controllers/subscriptionController.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/validate', protect, validateSubscription);

export default router;
