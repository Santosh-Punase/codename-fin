import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import { expect, use } from 'chai';

import Transaction from '../../src/models/Transaction.js';
import logger from '../../src/utils/logger.js';
import { ERROR_CODES } from '../../src/const/errorCodes.js';
import { ERROR } from '../../src/const/errorMessages.js';
import {
  addTransaction, deleteTransaction, getTransactions, updateTransaction,
} from '../../src/controllers/transactionController.js';

use(sinonChai);

const mockUser = { id: '123' };
const mockTransaction = {
  amount: 100,
  remark: 'Test',
  category: 'Food',
  date: '2024-06-07',
  user: mockUser.id,
};

describe('Transaction Controller', () => {
  let request;
  let response;
  let saveStub;
  let findStub;
  let findByIdStub;
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
    saveStub = sinon.stub(Transaction.prototype, 'save');
    findStub = sinon.stub(Transaction, 'find');
    findByIdStub = sinon.stub(Transaction, 'findById');
    deleteOneStub = sinon.stub(Transaction.prototype, 'deleteOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('addTransaction', () => {
    it('should add a transaction and return 201', async () => {
      const mockResponse = { ...mockTransaction, _id: mockUser.id };
      saveStub.resolves(mockResponse);
      response.json.returns(mockResponse);

      const res = await addTransaction(request, response);

      expect(response.status).to.have.been.calledWith(201);
      expect(res).to.have.keys(Object.keys(mockResponse));
    });

    it('should return 500 if there is an error', async () => {
      saveStub.rejects(new Error('Database error'));
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
      const mockTransactions = [{
        _id: '1',
        amount: 100,
        remark: 'Test',
        category: 'Food',
        date: '2024-06-07',
        user: mockUser.id,
      }];
      findStub.resolves(mockTransactions);
      response.json.returns(mockTransactions);

      await getTransactions(request, response);

      expect(response.status).to.have.been.calledWith(200);
      expect(response.json).to.have.been.calledWith(mockTransactions);
    });

    it('should return 500 if there is an error', async () => {
      findStub.rejects(new Error('Database error'));

      await getTransactions(request, response);

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
      category: 'Food',
      date: '2024-06-07',
      user: mockUser.id,
    };
    const updateRequest = {
      body: mockTransaction,
      user: mockUser,
      params: { id: transaction._id },
    };

    it.skip('should update a transaction and return 200', async () => {
      findByIdStub.resolves(transaction);
      const mockResponse = { ...mockTransaction, _id: mockUser.id };
      saveStub.resolves(mockResponse);

      await updateTransaction(updateRequest, response);

      expect(response.status).to.have.been.calledWith(200);
    });

    it('should return 404 if transaction not found', async () => {
      findByIdStub.resolves(null);
      const id = transaction._id;

      await updateTransaction(updateRequest, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update transactions for user: ${mockUser.id}, Error: ${id} does not exist`,
        );
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.UPDATE_FAILED_TRANSACTION_DOES_NOT_EXIST,
        },
      });
    });

    it('should return 401 if unauthorized', async () => {
      const userId = '456';
      const { id } = updateRequest.params;
      findByIdStub.resolves(transaction);

      await updateTransaction({ ...updateRequest, user: { id: userId } }, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update transaction ${id}, Error: user ${userId} is not authorised`,
        );
      expect(response.status).to.have.been.calledWith(401);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.UPDATE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findByIdStub.rejects(new Error('Database error'));
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
    it.skip('should delete a transaction and return 200', async () => {
      findByIdStub.resolves({ ...mockTransaction, user: mockTransaction.user.id });
      deleteOneStub.resolves();

      await deleteTransaction(deleteRequest, response);

      expect(response.status).to.have.been.calledWith(200);
    });

    it('should return 404 if transaction not found', async () => {
      findByIdStub.resolves(null);
      const id = transaction._id;

      await deleteTransaction(deleteRequest, response);

      expect(response.status).to.have.been.calledWith(404);
      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete transaction ${id} for user ${mockUser.id}, Error: ${id} does not exist`,
        );
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,
          message: ERROR.DELETE_FAILED_TRANSACTION_DOES_NOT_EXIST,
        },
      });
    });

    it('should return 401 if unauthorized', async () => {
      const userId = '456';
      const { id } = deleteRequest.params;
      findByIdStub.resolves(transaction);

      await deleteTransaction({ ...deleteRequest, user: { id: userId } }, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to delete transaction ${id}, Error: user ${userId} is not authorised`,
        );
      expect(response.status).to.have.been.calledWith(401);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
          message: ERROR.DELETE_FAILED_TRANSACTION_UNAUTHORIZED,
        },
      });
    });

    it('should return 500 if there is an error', async () => {
      findByIdStub.rejects(new Error('Database error'));
      const id = transaction._id;

      await deleteTransaction(deleteRequest, response);

      expect(logger.error).to.have.been
        .calledWith(
          `Unable to update transaction ${id} for user ${mockUser.id}, Error: Database error`,
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
