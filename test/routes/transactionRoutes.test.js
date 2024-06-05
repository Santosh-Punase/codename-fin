import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { server, expect } from '../server.js';

import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Transaction from '../../src/models/Transaction.js';
import {
  JWT_SECRET, JWT_EXPIRY, DB_URI_TEST, TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD,
} from '../../src/config/env.js';

let token;
let userId;

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
          remark: 'Test transaction',
          category: 'Food',
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('amount', 100);
          expect(res.body).to.have.property('remark', 'Test transaction');
          expect(res.body).to.have.property('category', 'Food');
          done();
        });
    });

    it('should Not add a new transaction with invalid amount', (done) => {
      server.request(app)
        .post('/api/transactions')
        .set('Authorization', token)
        .send({
          remark: 'Test transaction',
          category: 'Food',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should Not add a new transaction with invalid remark', (done) => {
      server.request(app)
        .post('/api/transactions')
        .set('Authorization', token)
        .send({
          amount: 100,
          category: 'Food',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should Not add a new transaction with invalid category', (done) => {
      server.request(app)
        .post('/api/transactions')
        .set('Authorization', token)
        .send({
          amount: 100,
          remark: 'Test transaction',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
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
        remark: 'Test transaction',
        category: 'Food',
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
          category: 'Food',
          date: new Date().toISOString(),
        })
        .end((err, res) => {
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
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should Not edit a transaction with invalid remark', (done) => {
      server.request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', token)
        .send({
          amount: 100,
          remark: '',
          category: 'Food',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should Not edit a transaction with invalid category', (done) => {
      server.request(app)
        .put(`/api/transactions/${transactionId}`)
        .set('Authorization', token)
        .send({
          amount: 100,
          remark: 'Test transaction',
          category: '',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });
  });

  describe('GET /api/transactions', () => {
    it('should get all transactions for the user', (done) => {
      server.request(app)
        .get('/api/transactions')
        .set('Authorization', token)
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.be.an('array');
          done();
        });
    });
  });
});
