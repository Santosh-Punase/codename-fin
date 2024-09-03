import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { expect, use } from 'chai';

import Transaction from '../../src/models/Transaction.js';
import Category from '../../src/models/Category.js';
import logger from '../../src/utils/logger.js';
import { ERROR_CODES } from '../../src/const/errorCodes.js';
import { ERROR } from '../../src/const/errorMessages.js';
import {
  addTransaction, deleteTransaction, getTransactions, updateTransaction,
} from '../../src/controllers/transactionController.js';
import PaymentMode from '../../src/models/PaymentMode.js';
import { TRANSACTION_TYPE } from '../../src/config/contants.js';

use(sinonChai);

const mockUser = { id: '60d21b4667d0d6473e610a83' };
const mockTransaction = {
  amount: 100,
  remark: 'Test',
  type: TRANSACTION_TYPE.EXPENSE,
  category: '60d21b4667d0d8992e610c85',
  paymentMode: '66bb354ab83d97ec675dfd39',
  date: '2024-06-07',
  user: mockUser.id,
};

const mockCategory = {
  user: mockUser.id,
  name: 'Entertainment',
  budget: 500,
  expenditure: 0,
};

const mockPaymentMode = {
  user: mockUser.id,
  name: 'Online',
};

describe('Transaction Controller', () => {
  let request;
  let response;
  let saveTransactionStub;
  let saveCategoryStub;
  let savePaymentModeStub;
  let findTransactionStub;
  let findOneCategoryStub;
  let findOnePaymentModeStub;
  let findOneTransactionStub;
  let deleteOneStub;

  beforeEach(() => {
    request = {
      user: mockUser,
      body: mockTransaction,
    };
    response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub(),
    };
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
    saveTransactionStub = sinon.stub(Transaction.prototype, 'save');
    saveCategoryStub = sinon.stub();
    savePaymentModeStub = sinon.stub();
    findTransactionStub = sinon.stub(Transaction, 'find');
    findOneCategoryStub = sinon.stub(Category, 'findOne');
    findOnePaymentModeStub = sinon.stub(PaymentMode, 'findOne');
    findOneTransactionStub = sinon.stub(Transaction, 'findOne');
    deleteOneStub = sinon.stub(Transaction.prototype, 'deleteOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addTransaction', () => {
    it('should add a transaction and return 201', async () => {
      const mockResponse = { ...mockTransaction, _id: mockUser.id };
      findOneCategoryStub.resolves({ ...mockCategory, save: saveCategoryStub });
      findOnePaymentModeStub.resolves({ ...mockPaymentMode, save: savePaymentModeStub });
      saveTransactionStub.resolves(mockResponse);
      saveCategoryStub.resolves(mockCategory);
      savePaymentModeStub.resolves(mockPaymentMode);
      response.json.returns(mockResponse);

      const res = await addTransaction(request, response);

      expect(response.status).to.have.been.calledWith(201);
      expect(res).to.have.keys(Object.keys(mockResponse));
    });

    it('should return 404 if there is no category associated', async () => {
      const mockResponse = { ...mockTransaction, _id: mockUser.id };
      findOneCategoryStub.resolves(null);
      saveTransactionStub.resolves(mockResponse);
      findOnePaymentModeStub.resolves({ ...mockPaymentMode });
      saveCategoryStub.resolves(mockCategory);
      response.json.returns(mockResponse);

      await addTransaction(request, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          `Unable to add transaction for user: ${mockUser.id}, Error: CATEGORY_NOT_FOUND`,
        );
      expect(response.json).to.have.been.calledWith({
        error: { code: ERROR_CODES.CATEGORY_NOT_FOUND, message: ERROR.CATEGORY_NOT_FOUND },
      });
    });

    it('should return 500 if there is an error', async () => {
      findOneCategoryStub.resolves({ ...mockCategory, save: saveCategoryStub });
      findOnePaymentModeStub.resolves({ ...mockPaymentMode, save: savePaymentModeStub });
      saveCategoryStub.resolves(mockCategory);
      savePaymentModeStub.resolves(mockPaymentMode);
      saveTransactionStub.rejects(new Error('Database error'));
      response.json.returns(new Error('Database error'));

      await addTransaction(request, response);

      expect(response.status).to.have.been.calledWith(500);
      expect(logger.error).to.have.been
        .calledWith(`Unable to add transaction for user: ${mockUser.id}, Error: Database error`);
      expect(response.json).to.have.been.calledWith({
        error: { code: ERROR_CODES.ADD_TRANSACTION_FAILED, message: ERROR.ADD_TRANSACTION_FAILED },
      });
    });
  });

  describe('getTransactions', () => {
    it('should get all transactions for a user and return 200', async () => {
      const mockTransactions = [
        {
          _id: 'transaction1',
          amount: 100,
          type: TRANSACTION_TYPE.EXPENSE,
          remark: 'Food expense',
          date: '2024-09-02T11:04:31.231Z',
          category: { _id: 'category1', name: 'Food' },
          paymentMode: { _id: 'paymentMode1', name: 'Cash' },
          user: mockUser.id,
        },
        {
          _id: 'transaction2',
          amount: 50,
          type: TRANSACTION_TYPE.EXPENSE,
          remark: 'Entertainment expense',
          date: '2024-08-01T11:04:31.231Z',
          category: { _id: 'category2', name: 'Entertainment' },
          paymentMode: { _id: 'paymentMode2', name: 'Credit Card' },
          user: mockUser.id,
        },
      ];
      findTransactionStub.returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().resolves(mockTransactions),
      });
      const limit = 10;
      const page = 1;
      sinon.stub(Transaction, 'countDocuments').returns(mockTransactions.length);

      await getTransactions({ ...request, query: { limit, page } }, response);

      expect(response.status).to.have.been.calledWith(200);
      // expect(response.json).to.have.been.calledWith({
      //   transactions: mockTransactions,
      //   totalTransactions: mockTransactions.length,
      //   totalPages: Math.ceil(mockTransactions.length / limit),
      //   currentPage: Number(page),
      // });
    });

    it('should return 500 if there is an error', async () => {
      findTransactionStub.returns({
        populate: sinon.stub().returnsThis(),
        sort: sinon.stub().returnsThis(),
        skip: sinon.stub().returnsThis(),
        limit: sinon.stub().rejects(new Error('Database error')),
      });

      await getTransactions({ ...request, query: {} }, response);

      expect(response.status).to.have.been.calledWith(500);
      expect(logger.error).to.have.been
        .calledWith(`Unable to get transactions for user: ${mockUser.id}, Error: Database error`);
      expect(response.json).to.have.been.calledWith({
        error: { code: ERROR_CODES.GET_TRANSACTION_FAILED, message: ERROR.GET_TRANSACTION_FAILED },
      });
    });
  });

  describe('updateTransaction', () => {
    const transaction = {
      _id: '1',
      amount: 100,
      remark: 'Test',
      type: TRANSACTION_TYPE.EXPENSE,
      category: '60d21b4667d0d8992e610c85',
      paymentMode: '66bb354ab83d97ec675dfd39',
      date: '2024-06-07',
      user: mockUser.id,
    };
    const updateRequest = {
      body: mockTransaction,
      user: mockUser,
      params: { id: transaction._id },
    };

    it('should update a transaction and return 200', async () => {
      const saveTransaction = sinon.stub();
      findOneTransactionStub.resolves({
        ...transaction,
        category: { equals: sinon.stub().resolves(true) },
        paymentMode: { equals: sinon.stub().resolves(true) },
        save: saveTransaction,
      });
      findOneCategoryStub.resolves({ ...mockCategory, save: saveCategoryStub });
      findOnePaymentModeStub.resolves({ ...mockPaymentMode, save: savePaymentModeStub });
      const mockResponse = { ...mockTransaction, _id: mockUser.id };
      saveTransactionStub.resolves(mockResponse);

      await updateTransaction(updateRequest, response);

      expect(response.status).to.have.been.calledWith(200);
      // eslint-disable-next-line no-unused-expressions
      expect(findOneCategoryStub).not.to.have.been.called;
      // eslint-disable-next-line no-unused-expressions
      expect(findOnePaymentModeStub).not.to.have.been.called;
    });

    it('should return 404 if transaction not found', async () => {
      findOneTransactionStub.resolves(null);
      const id = transaction._id;

      await updateTransaction(updateRequest, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          // eslint-disable-next-line max-len
          `Unable to update transaction ${id} for user ${mockUser.id}, Error: TRANSACTION_NOT_FOUND`,
        );
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.TRANSACTION_NOT_FOUND,
          message: ERROR.TRANSACTION_NOT_FOUND,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findOneTransactionStub.rejects(new Error('Database error'));
      const id = transaction._id;

      await updateTransaction(updateRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update transaction ${id} for user ${mockUser.id}, Error: Database error`,
        );
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_TRANSACTION_FAILED,
          message: ERROR.UPDATE_TRANSACTION_FAILED,
        },
      });
    });
  });

  describe('deleteTransaction', () => {
    const transaction = {
      _id: '1',
      amount: 100,
      remark: 'Test',
      category: 'Food',
      date: '2024-06-07',
      user: mockUser.id,
    };
    const deleteRequest = {
      body: mockTransaction,
      user: mockUser,
      params: { id: transaction._id },
    };
    it('should delete a transaction and return 200', async () => {
      const deleteOne = sinon.stub();
      findOneTransactionStub.resolves({ ...mockTransaction, deleteOne });
      findOneCategoryStub.resolves({ ...mockCategory, save: saveCategoryStub });
      findOnePaymentModeStub.resolves({ ...mockPaymentMode, save: savePaymentModeStub });
      deleteOneStub.resolves();

      await deleteTransaction(deleteRequest, response);

      expect(response.status).to.have.been.calledWith(200);
      expect(saveCategoryStub).to.have.been.calledBefore(deleteOne);
    });

    it('should return 404 if transaction not found', async () => {
      findOneTransactionStub.resolves(null);
      const id = transaction._id;

      await deleteTransaction(deleteRequest, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          // eslint-disable-next-line max-len
          `Unable to delete transaction ${id} for user ${mockUser.id}, Error: TRANSACTION_NOT_FOUND`,
        );
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.TRANSACTION_NOT_FOUND,
          message: ERROR.TRANSACTION_NOT_FOUND,
        },
      });
    });

    it('should return 404 if unauthorized', async () => {
      const userId = '456';
      const { id } = deleteRequest.params;
      findOneTransactionStub.resolves(null);

      await deleteTransaction({ ...deleteRequest, user: { id: userId } }, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete transaction ${id} for user ${userId}, Error: TRANSACTION_NOT_FOUND`,
        );
      expect(response.status).to.have.been.calledWith(404);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.TRANSACTION_NOT_FOUND,
          message: ERROR.TRANSACTION_NOT_FOUND,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findOneTransactionStub.rejects(new Error('Database error'));
      const id = transaction._id;

      await deleteTransaction(deleteRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete transaction ${id} for user ${mockUser.id}, Error: Database error`,
        );
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_TRANSACTION_FAILED,
          message: ERROR.DELETE_TRANSACTION_FAILED,
        },
      });
    });
  });
});
