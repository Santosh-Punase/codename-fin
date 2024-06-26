import express from 'express';
import sinon from 'sinon';

import { server, expect } from '../server.js';
import {
  userValidationRules,
  validateUser,
} from '../../src/middleware/userValidator.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';
import User from '../../src/models/User.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';
import { TEST_USER_EMAIL } from '../../src/config/env.js';

// Express setup for testing
const app = express();
app.use(express.json());

// Mock User model
let findUserStub;

const SUCCESS_MESSAGE = 'validation successful';

app.post(
  '/test-user',
  userValidationRules,
  validateUser,
  (_req, res) => res.status(200).send(SUCCESS_MESSAGE),
);

describe('User Validator Middleware', () => {
  beforeEach(() => {
    findUserStub = sinon.stub(User, 'findOne');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should fail if email is invalid', async () => {
    const res = await server.request(app)
      .post('/test-user')
      .send({ email: 'invalid-email', password: '123456', confirmPassword: '123456' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_EMAIL,
      message: VALIDATION_ERROR.INVALID_EMAIL,
    });
  });

  it('should fail if email already exists', async () => {
    findUserStub.resolves({ email: TEST_USER_EMAIL });

    const res = await server.request(app)
      .post('/test-user')
      .send({ email: TEST_USER_EMAIL, password: '123456', confirmPassword: '123456' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS,
      message: VALIDATION_ERROR.EMAIL_ALREADY_EXISTS,
    });
  });

  it('should fail if password length is invalid', async () => {
    const res = await server.request(app)
      .post('/test-user')
      .send({ email: TEST_USER_EMAIL, password: '123', confirmPassword: '123' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_PASSWORD_LENGTH,
      message: VALIDATION_ERROR.INVALID_PASSWORD_LENGTH,
    });
  });

  it('should fail if passwords do not match', async () => {
    const res = await server.request(app)
      .post('/test-user')
      .send({ email: TEST_USER_EMAIL, password: '123456', confirmPassword: '654321' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.PASSWORD_DO_NOT_MATCH,
      message: VALIDATION_ERROR.PASSWORD_DO_NOT_MATCH,
    });
  });

  it('should pass if all fields are valid', async () => {
    findUserStub.resolves(null);

    const res = await server.request(app)
      .post('/test-user')
      .send({ email: TEST_USER_EMAIL, password: '123456', confirmPassword: '123456' });

    expect(res).to.have.status(200);
    expect(res.text).to.equal(SUCCESS_MESSAGE);
  });
});
