import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

import { server, expect } from '../server.js';

import app from '../../src/app.js';
import User from '../../src/models/User.js';
import Category from '../../src/models/Category.js';
import {
  JWT_SECRET, JWT_EXPIRY, DB_URI_TEST, TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD,
} from '../../src/config/env.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';
import { CATEGORY_TYPE } from '../../src/config/contants.js';

let token;
let userId;

describe('Category Routes', () => {
  before(async () => {
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
    await Category.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/categories', () => {
    it('should add a new category', (done) => {
      server.request(app)
        .post('/api/categories')
        .set('Authorization', token)
        .send({
          name: 'Entertainment',
          budget: 500,
          type: CATEGORY_TYPE.EXPENSE,
        })
        .end((_err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('name', 'Entertainment');
          expect(res.body).to.have.property('budget', 500);
          expect(res.body).to.have.property('expenditure', 0);
          done();
        });
    });

    it('should Not add an INVALID category', (done) => {
      server.request(app)
        .post('/api/categories')
        .set('Authorization', token)
        .send({
          name: 'Entertainment',
          budget: 400,
        })
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.CATEGORY_TYPE_IS_REQUIRED);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_CATEGORY_TYPE);
          done();
        });
    });

    it('should Not add an INVALID category', (done) => {
      server.request(app)
        .post('/api/categories')
        .set('Authorization', token)
        .send({
          name: 'Entertainment',
          budget: '',
          type: CATEGORY_TYPE.EXPENSE,
        })
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.BUDGET_IS_REQUIRED);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_BUDGET);
          done();
        });
    });
  });

  describe('PUT /api/categories/:id', () => {
    let categoryId;

    before(async () => {
      const category = new Category({
        name: 'Entertainment',
        budget: 500,
        expenditure: 0,
        type: CATEGORY_TYPE.EXPENSE,
        user: userId,
      });
      await category.save();
      categoryId = category._id;
    });

    it('should edit an existing Category', (done) => {
      server.request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', token)
        .send({
          name: 'Entertainment',
          budget: 600,
          type: CATEGORY_TYPE.EXPENSE,
        })
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('name', 'Entertainment');
          expect(res.body).to.have.property('budget', 600);
          expect(res.body).to.have.property('expenditure', 0);
          done();
        });
    });

    it('should Not edit a category with invalid budget', (done) => {
      server.request(app)
        .put(`/api/categories/${categoryId}`)
        .set('Authorization', token)
        .send({
          name: 'Entertainment',
          budget: 'invalid',
          type: CATEGORY_TYPE.EXPENSE,
        })
        .end((_err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.INVALID_BUDGET);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_BUDGET);
          done();
        });
    });
  });

  describe('GET /api/categories', () => {
    it('should get all categories for the user', (done) => {
      server.request(app)
        .get('/api/categories')
        .set('Authorization', token)
        .end((_err, res) => {
          expect(res).to.have.status(200);
          expect(res.body.categories).to.be.an('array');
          done();
        });
    });
  });

  describe('DELETE /api/categories', () => {
    let categoryId;

    before(async () => {
      const category = new Category({
        name: 'Entertainment',
        budget: 500,
        expenditure: 0,
        type: CATEGORY_TYPE.EXPENSE,
        user: userId,
      });
      await category.save();
      categoryId = category._id;
    });

    it('should delete category', (done) => {
      server.request(app)
        .delete(`/api/categories/${categoryId}`)
        .set('Authorization', token)
        .end((_err, res) => {
          expect(res).to.have.status(200);
          done();
        });
    });
  });
});
