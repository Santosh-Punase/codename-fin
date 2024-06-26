import express from 'express';

import {
  addCategory, getCategories, updateCategory, deleteCategory,
} from '../controllers/categoryController.js';
import protect from '../middleware/authMiddleware.js';
import {
  categoryValidationRules,
  validateCategory,
} from '../middleware/categoryValidator.js';

const router = express.Router();

router.post('/', protect, categoryValidationRules, validateCategory, addCategory);
router.get('/', protect, getCategories);
router.put('/:id', protect, categoryValidationRules, validateCategory, updateCategory);
router.delete('/:id', protect, deleteCategory);

export default router;
