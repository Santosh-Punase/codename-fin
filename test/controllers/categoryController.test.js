import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { expect, use } from 'chai';

import Category from '../../src/models/Category.js';
import logger from '../../src/utils/logger.js';
import { ERROR_CODES } from '../../src/const/errorCodes.js';
import { ERROR } from '../../src/const/errorMessages.js';
import {
  addCategory, deleteCategory, getCategories, updateCategory,
} from '../../src/controllers/categoryController.js';
import { CATEGORY_TYPE } from '../../src/config/contants.js';

use(sinonChai);

const mockUser = { id: '123' };

const mockCategory = {
  user: mockUser.id,
  name: 'Entertainment',
  budget: 500,
  expenditure: 0,
};

describe('Category Controller', () => {
  let request;
  let response;
  let saveCategoryStub;
  let findCategoryStub;
  let findCategoryByIdStub;
  let deleteOneStub;

  beforeEach(() => {
    request = {
      user: mockUser,
      body: mockCategory,
    };
    response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
    saveCategoryStub = sinon.stub(Category.prototype, 'save');
    findCategoryStub = sinon.stub(Category, 'find');
    findCategoryByIdStub = sinon.stub(Category, 'findById');
    deleteOneStub = sinon.stub(Category.prototype, 'deleteOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addCategory', () => {
    it('should add a category and return 201', async () => {
      const mockResponse = { ...mockCategory, _id: mockUser.id };
      saveCategoryStub.resolves(mockCategory);
      response.json.returns(mockResponse);

      const res = await addCategory(request, response);

      expect(response.status).to.have.been.calledWith(201);
      expect(res).to.have.keys(Object.keys(mockResponse));
    });

    it('should return 500 if there is an error', async () => {
      findCategoryStub.resolves({ ...mockCategory, save: saveCategoryStub });
      saveCategoryStub.rejects(new Error('Database error'));

      await addCategory(request, response);

      expect(response.status).to.have.been.calledWith(500);
      expect(logger.error).to.have.been
        .calledWith(`Unable to add category for user: ${mockUser.id}, Error: Database error`);
      expect(response.json).to.have.been.calledWith({
        error: { code: ERROR_CODES.ADD_CATEGORY_FAILED, message: ERROR.ADD_CATEGORY_FAILED },
      });
    });
  });

  describe('getCategories', () => {
    let countDocumentsStub;

    beforeEach(() => {
      countDocumentsStub = sinon.stub(Category, 'countDocuments');
    });

    it('should get all categories for a user and return 200', async () => {
      const category = {
        _id: 'abc123',
        name: 'Entertainment',
        budget: 500,
        type: CATEGORY_TYPE.INCOME,
        expenditure: 0,
      };
      const mockCategories = [category];

      findCategoryStub.returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockCategories),
      });
      countDocumentsStub.resolves(1);

      await getCategories({ ...request, query: { } }, response);
      expect(response.status).to.have.been.calledWith(200);
      expect(response.json).to.have.been.calledWith({
        categories: [{
          id: 'abc123',
          name: 'Entertainment',
          budget: 500,
          type: CATEGORY_TYPE.INCOME,
          expenditure: 0,
          updatedAt: undefined,
        }],
        totalCategories: 1,
        totalPages: 1,
        currentPage: 1,
      });
    });

    it('should return 500 if there is an error', async () => {
      findCategoryStub.returns({
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().rejects(new Error('Database error')),
      });

      await getCategories({ ...request, query: { } }, response);

      expect(response.status).to.have.been.calledWith(500);
      expect(logger.error).to.have.been
        .calledWith(`Unable to get categories for user: ${mockUser.id}, Error: Database error`);
      expect(response.json).to.have.been.calledWith({
        error: { code: ERROR_CODES.GET_CATEGORY_FAILED, message: ERROR.GET_CATEGORY_FAILED },
      });
    });
  });

  describe('updateCategory', () => {
    const category = {
      _id: '1',
      name: 'Entertainment',
      budget: 1000,
      expenditure: 40,
      date: '2024-06-07',
      user: mockUser.id,
    };
    const updateRequest = {
      body: mockCategory,
      user: mockUser,
      params: { id: category._id },
    };

    it('should update a category and return 200', async () => {
      const saveCategory = sinon.stub();
      findCategoryByIdStub.resolves({ ...category, save: saveCategory });
      findCategoryByIdStub.resolves({ ...mockCategory, save: saveCategoryStub });

      await updateCategory(updateRequest, response);

      expect(response.status).to.have.been.calledWith(200);
    });

    it('should return 404 if transaction not found', async () => {
      findCategoryByIdStub.resolves(null);
      const id = category._id;

      await updateCategory(updateRequest, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update category for user: ${mockUser.id}, Error: ${id} does not exist`,
        );
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_CATEGORY_DOES_NOT_EXIST,
        },
      });
    });

    it('should return 401 if unauthorized', async () => {
      const userId = '456';
      const { id } = updateRequest.params;
      findCategoryByIdStub.resolves(category);

      await updateCategory({ ...updateRequest, user: { id: userId } }, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update category ${id}, Error: user ${userId} is not authorised`,
        );
      expect(response.status).to.have.been.calledWith(401);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_CATEGORY_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_CATEGORY_UNAUTHORIZED,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findCategoryByIdStub.rejects(new Error('Database error'));
      const id = category._id;

      await updateCategory(updateRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update category ${id} for user ${mockUser.id}, Error: Database error`,
        );
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_CATEGORY_FAILED,
          message: ERROR.UPDATE_CATEGORY_FAILED,
        },
      });
    });
  });

  describe('deleteCategory', () => {
    const category = {
      _id: '1',
      name: 'Entertainment',
      budget: 1000,
      expenditure: 40,
      date: '2024-06-07',
      user: mockUser.id,
    };
    const deleteRequest = {
      body: mockCategory,
      user: mockUser,
      params: { id: category._id },
    };
    it('should delete a category and return 200', async () => {
      const deleteOne = sinon.stub();
      findCategoryByIdStub.resolves({ ...mockCategory, deleteOne });
      deleteOneStub.resolves();

      await deleteCategory(deleteRequest, response);

      expect(response.status).to.have.been.calledWith(200);
    });

    it('should return 404 if category not found', async () => {
      findCategoryByIdStub.resolves(null);
      const id = category._id;

      await deleteCategory(deleteRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete category ${id} for user ${mockUser.id}, Error: ${id} does not exist`,
        );
      expect(response.status).to.have.been.calledWith(404);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_FAILED_CATEGORY_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_CATEGORY_DOES_NOT_EXIST,
        },
      });
    });

    it('should return 401 if unauthorized', async () => {
      const userId = '456';
      const { id } = deleteRequest.params;
      findCategoryByIdStub.resolves(category);

      await deleteCategory({ ...deleteRequest, user: { id: userId } }, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete category ${id}, Error: user ${userId} is not authorised`,
        );
      expect(response.status).to.have.been.calledWith(401);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_FAILED_CATEGORY_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_CATEGORY_UNAUTHORIZED,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findCategoryByIdStub.rejects(new Error('Database error'));
      const id = category._id;

      await deleteCategory(deleteRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update category ${id} for user ${mockUser.id}, Error: Database error`,
        );
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_CATEGORY_FAILED,
          message: ERROR.DELETE_CATEGORY_FAILED,
        },
      });
    });
  });
});
