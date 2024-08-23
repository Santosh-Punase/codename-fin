import Category from '../models/Category.js';
import logger from '../utils/logger.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';

export const addCategory = async (req, res) => {
  const { name, type, budget } = req.body;
  try {
    const category = new Category({
      user: req.user.id,
      name,
      type,
      budget,
    });
    await category.save();
    return res.status(201).json(category);
  } catch (err) {
    logger.error(`Unable to add category for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.ADD_CATEGORY_FAILED, message: ERROR.ADD_CATEGORY_FAILED },
    });
  }
};

export const getCategories = async (req, res) => {
  const { page = 1, limit = 50, type } = req.query;

  try {
    const matchCondition = { user: req.user._id };
    if (type) matchCondition.type = type; // Filter by type if provided

    const categories = await Category.find(matchCondition)
      .sort({ updatedAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const totalCategories = await Category.countDocuments(matchCondition);

    return res.status(200).json({
      categories: categories.map((category) => ({
        id: category._id,
        name: category.name,
        type: category.type,
        budget: category.budget,
        expenditure: category.expenditure,
        updatedAt: category.updatedAt,
      })),
      totalCategories,
      totalPages: Math.ceil(totalCategories / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    logger.error(`Unable to get categories for user: ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: { code: ERROR_CODES.GET_CATEGORY_FAILED, message: ERROR.GET_CATEGORY_FAILED },
    });
  }
};

export const updateCategory = async (req, res) => {
  const { id } = req.params;
  const { name, type, budget } = req.body;

  try {
    const category = await Category.findById(id);

    if (!category) {
      logger.error(
        `Unable to update category for user: ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST,
        },
      });
    }
    if (category.user.toString() !== req.user.id) {
      logger.error(
        `Unable to update category ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_CATEGORY_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_CATEGORY_UNAUTHORIZED,
        },
      });
    }

    category.name = name;
    category.type = type;
    category.budget = budget;
    await category.save();
    return res.status(200).json(category);
  } catch (err) {
    logger.error(`Unable to update category ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.UPDATE_CATEGORY_FAILED,
        message: ERROR.UPDATE_CATEGORY_FAILED,
      },
    });
  }
};

export const deleteCategory = async (req, res) => {
  const { id } = req.params;
  try {
    const category = await Category.findById(id);
    if (!category) {
      logger.error(
        `Unable to delete category ${id} for user ${req.user.id}, Error: ${id} does not exist`,
      );
      return res.status(404).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_CATEGORY_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_CATEGORY_DOES_NOT_EXIST,
        },
      });
    }
    if (category.user.toString() !== req.user.id) {
      logger.error(
        `Unable to delete category ${id}, Error: user ${req.user.id} is not authorised`,
      );
      return res.status(401).json({
        error: {
          code: ERROR_CODES.DELETE_FAILED_CATEGORY_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_CATEGORY_UNAUTHORIZED,
        },
      });
    }
    await category.deleteOne();
    return res.status(200).json({ message: 'Category deleted' });
  } catch (err) {
    logger.error(`Unable to update category ${id} for user ${req.user.id}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.DELETE_CATEGORY_FAILED,
        message: ERROR.DELETE_CATEGORY_FAILED,
      },
    });
  }
};

export const setBudget = async (req, res) => {
  const userId = req.user._id;
  const { budgets } = req.body;

  try {
    if (!budgets || !Array.isArray(budgets) || budgets.length === 0) {
      logger.error(`Unable to set budget for user ${userId}, Err: Invalid Budget`);
      return res.status(400).json({
        error: {
          code: ERROR_CODES.INVALID_BUDGETS,
          message: ERROR.INVALID_BUDGETS,
        },
      });
    }

    const bulkOperations = budgets.map((budget) => ({
      updateOne: {
        filter: { _id: budget.categoryId, user: userId },
        update: { $set: { budget: budget.amount } },
      },
    }));

    const result = await Category.bulkWrite(bulkOperations);

    return res.status(200).json({
      message: 'Budgets updated successfully.',
      modifiedCount: result.modifiedCount,
    });
  } catch (err) {
    logger.error(`Unable to update budgets for user ${userId}, ${err}`);
    return res.status(500).json({
      error: {
        code: ERROR_CODES.BUDGET_UPDATE_FAILED,
        message: ERROR.BUDGET_UPDATE_FAILED,
      },
    });
  }
};
