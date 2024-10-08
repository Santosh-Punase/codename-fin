import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { server, expect } from '../server.js';

import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Transaction from '../../src/models/Transaction.js';
import {
  JWT_SECRET, JWT_EXPIRY, DB_URI_TEST, TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD,
} from '../../src/config/env.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';
import { CATEGORY_TYPE, PAYMENT_MODE_TYPE, TRANSACTION_TYPE } from '../../src/config/contants.js';
import Category from '../../src/models/Category.js';
import PaymentMode from '../../src/models/PaymentMode.js';

let token;
let userId;
let categoryId;
let paymentModeId;

describe('Transaction Routes', () => {
  before(async () => {
    // Create a test user and get token
    await mongoose.connect(DB_URI_TEST);
    const user = new User({
      username: TEST_USER_NAME,
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD,
    });
    await user.save();
    userId = user._id;

    const category = new Category({
      name: 'Entertainment',
      budget: 500,
      expenditure: 0,
      type: CATEGORY_TYPE.EXPENSE,
      user: userId,
    });

    const pMode = new PaymentMode({
      name: 'Online',
      balance: 500,
      type: PAYMENT_MODE_TYPE.CASH,
      user: userId,
    });
    await category.save();
    await pMode.save();
    paymentModeId = pMode._id;
    categoryId = category._id;

    token = `Bearer ${jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY })}`;
  });

  after(async () => {
    await User.deleteMany({});
    await Transaction.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/transactions', () => {
    it('should add a new transaction', (done) => {
      server.request(app)
        .post('/api/transactions')
        .set('Authorization', token)
        .send({
          amount: 100,
          type: TRANSACTION_TYPE.EXPENSE,
          remark: 'Test transaction',
          paymentMode: paymentModeId,
          category: categoryId,
        })
        .end((_err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('amount', 100);
          expect(res.body).to.have.property('type', TRANSACTION_TYPE.EXPENSE);
          expect(res.body).to.have.property('remark', 'Test transaction');
          expect(res.body).to.have.property('category', 'Entertainment');
          done();
        });
    });

    it('should Not add an INVALID transaction', (done) => {
      server.request(app)
        .post('/api/transactions')
        .set('Authorization', token)
        .send({
          type: TRANSACTION_TYPE.EXPENSE,
          remark: 'Test transaction',
          category: categoryId,
        })
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.AMOUNT_IS_REQUIRED);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_AMOUNT);
          done();
        });
    });
  });

  describe('PUT /api/transactions/:id', () => {
    let transactionId;

    before(async () => {
      const transaction = new Transaction({
        user: userId, // This should be the same user as in the token
        amount: 100,
        type: TRANSACTION_TYPE.EXPENSE,
        remark: 'Test transaction',
        paymentMode: paymentModeId,
        category: categoryId,
        date: new Date().toISOString(),
      });
      await transaction.save();
      transactionId = transaction._id;
    });

    it('should edit an existing transaction', (done) => {
      server.request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', token)
        .send({
          amount: 200,
          remark: 'Updated transaction',
          type: TRANSACTION_TYPE.INCOME,
          paymentMode: paymentModeId,
          category: categoryId,
          date: new Date().toISOString(),
        })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('amount', 200);
          expect(res.body).to.have.property('remark', 'Updated transaction');
          done();
        });
    });

    it('should Not edit a transaction with invalid amount', (done) => {
      server.request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', token)
        .send({
          amount: 'invalid',
          remark: 'Test transaction',
          category: 'Food',
        })
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.INVALID_AMOUNT);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_AMOUNT);
          done();
        });
    });
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions for the user', (done) => {
      server.request(app)
        .get('/api/transactions')
        .set('Authorization', token)
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.transactions).to.be.an('array');
          done();
        });
    });
  });

  describe('DELETE /api/transactions', () => {
    let transactionId;

    before(async () => {
      const transaction = new Transaction({
        user: userId, // This should be the same user as in the token
        amount: 100,
        type: TRANSACTION_TYPE.EXPENSE,
        remark: 'Test transaction',
        category: categoryId,
        paymentMode: paymentModeId,
        date: new Date().toISOString(),
      });
      await transaction.save();
      transactionId = transaction._id;
    });

    it('should delete transaction', (done) => {
      server.request(app)
        .delete(`/api/transactions/${transactionId}`)
        .set('Authorization', token)
        .end((_err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
