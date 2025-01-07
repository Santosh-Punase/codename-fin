/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import sinonChai from 'sinon-chai';
import { expect, use } from 'chai';

import User from '../../src/models/User.js';
import logger from '../../src/utils/logger.js';
import {
  JWT_SECRET, TEST_USER_EMAIL, TEST_USER_NAME, TEST_USER_PASSWORD, JWT_EXPIRY,
} from '../../src/config/env.js';
import { ERROR_CODES } from '../../src/const/errorCodes.js';
import { ERROR } from '../../src/const/errorMessages.js';
import { login, register } from '../../src/controllers/authController.js';
import Category from '../../src/models/Category.js';
import PaymentMode from '../../src/models/PaymentMode.js';

use(sinonChai);

describe('Auth Controller', () => {
  let request;
  let response;
  let userStub;
  let jwtStub;
  let addDefaultCategoriesStub;
  let addDefaultPaymentModesStub;

  beforeEach(() => {
    request = {
      body: {
        username: TEST_USER_NAME,
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
      },
    };
    response = {
      status: sinon.stub().returnsThis(),
      json: sinon.stub().returnsThis(),
    };
    userStub = sinon.stub(User.prototype, 'save');
    addDefaultCategoriesStub = sinon.stub(Category, 'insertMany');
    addDefaultPaymentModesStub = sinon.stub(PaymentMode, 'insertMany');
    jwtStub = sinon.stub(jwt, 'sign');
    sinon.stub(logger, 'info');
    sinon.stub(logger, 'error');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      userStub.resolves();
      addDefaultCategoriesStub.resolves();
      addDefaultPaymentModesStub.resolves();
      jwtStub.returns('validToken');
      await register(request, response);

      expect(userStub).to.have.been.calledOnce;
      expect(jwtStub).to.have.been
        .calledWith({ id: sinon.match.any }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      expect(logger.info).to.have.been.calledWith(`New user created ${request.body.email}`);
      expect(response.status).to.have.been.calledWith(201);
      expect(response.json).to.have.been.calledWith({ token: 'validToken' });
    });

    it('should return 500 if there is an error during registration', async () => {
      userStub.rejects(new Error('Save failed'));

      await register(request, response);

      expect(logger.error).to.have.been
        .calledWith(`Unable to register a user ${request.body.email}: Error: Save failed`);
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json)
        .to.have.been.calledWith({ error: { code: undefined, message: 'Save failed' } });
    });
  });

  describe('login', () => {
    beforeEach(() => {
      request = {
        body: {
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD,
        },
      };
      sinon.stub(User, 'findOne');
    });

    it('should log in a user and return a token', async () => {
      const mockUser = {
        _id: '123',
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD,
        matchPassword: sinon.stub().resolves(true),
      };
      User.findOne.resolves(mockUser);
      jwtStub.returns('validToken');

      await login(request, response);

      expect(User.findOne).to.have.been.calledWith({ email: request.body.email });
      expect(mockUser.matchPassword).to.have.been.calledWith(request.body.password);
      expect(jwtStub).to.have.been
        .calledWith({ id: mockUser._id }, JWT_SECRET, { expiresIn: JWT_EXPIRY });
      expect(response.status).to.have.been.calledWith(200);
      expect(response.json).to.have.been.calledWith({ token: 'validToken' });
    });

    it('should return 401 if credentials are invalid', async () => {
      User.findOne.resolves(null);

      await login(request, response);

      expect(response.status).to.have.been.calledWith(401);
      expect(response.json).to.have.been.calledWith({
        error: {
          code: ERROR_CODES.INVALID_CREDENTIALS,
          message: ERROR.INVALID_CREDENTIALS,
        },
      });
    });

    it('should return 500 if there is an error during login', async () => {
      User.findOne.rejects(new Error('Login failed'));

      await login(request, response);

      expect(logger.error).to.have.been
        .calledWith(`Unable to Login a user ${request.body.email}: Error: Login failed`);
      expect(response.status).to.have.been.calledWith(500);
      expect(response.json).to.have.been
        .calledWith({ error: { code: undefined, message: 'Login failed' } });
    });
  });
});
