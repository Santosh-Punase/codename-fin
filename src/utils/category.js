import Category from '../models/Category.js';

export const validateCategory = async (categoryId, userId) => {
  const category = await Category.findOne({ _id: categoryId, user: userId });
  if (!category) {
    throw new Error('CATEGORY_NOT_FOUND');
  }
  return category;
};

export const updateCategoryAmount = async (category, amount) => {
  // eslint-disable-next-line no-param-reassign
  category.expenditure += amount;

  await category.save();
};
