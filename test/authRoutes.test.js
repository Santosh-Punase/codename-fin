import mongoose from 'mongoose';

import { server, expect } from './server.js';
import app from '../src/app.js'; // Ensure server exports your app instance
import User from '../src/models/User.js';
import { TEST_USER_NAME, TEST_USER_EMAIL, TEST_USER_PASSWORD } from '../src/config/env.js';

describe('Auth Routes', () => {
  after(async () => {
    // Cleanup database after tests
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', (done) => {
      server.request(app)
        .post('/api/auth/register')
        .send({
          username: TEST_USER_NAME,
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        })
        .end((err, res) => {
          expect(res).to.have.status(201);
          expect(res.body).to.have.property('token');
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
