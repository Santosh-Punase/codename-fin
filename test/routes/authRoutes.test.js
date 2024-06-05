import mongoose from 'mongoose';

import { server, expect } from '../server.js';
import app from '../../src/app.js'; // Ensure server exports your app instance
import User from '../../src/models/User.js';
import { TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../../src/config/env.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';

describe('Auth Routes', () => {
  after(async () => {
    // Cleanup database after tests
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should not register a new user with invalid email', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: 'TEST_USER_EMAIL',
          password: TEST_USER_PASSWORD,
          confirmPassword: TEST_USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.INVALID_EMAIL);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_EMAIL);
          done();
        });
    });

    it('should not register a new user with invalid password', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          password: 'pass',
          confirmPassword: 'pass',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.INVALID_PASSWORD_LENGTH);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.INVALID_PASSWORD_LENGTH);
          done();
        });
    });

    it('should not register a new user with invalid confirmPassword', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          confirmPassword: 'password',
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.PASSWORD_DO_NOT_MATCH);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.PASSWORD_DO_NOT_MATCH);
          done();
        });
    });

    it('should register a new user', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          confirmPassword: TEST_USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not register an existing user again', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
          confirmPassword: TEST_USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res).to.have.status(400);
          expect(res.body.error.code).to.equal(VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS);
          expect(res.body.error.message).to.equal(VALIDATION_ERROR.EMAIL_ALREADY_EXISTS);
          done();
        });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login an existing user', (done) => {
      server.request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res).to.have.status(200);
          expect(res.body).to.have.property('token');
          done();
        });
    });

    it('should not login with incorrect credentials', (done) => {
      server.request(app)
        .post('/api/auth/login')
        .send({
          email: TEST_USER_EMAIL,
          password: 'wrongpassword',
        })
        .end((err, res) => {
          expect(res).to.have.status(401);
          expect(res.body).to.have.property('error');
          done();
        });
    });
  });
});
