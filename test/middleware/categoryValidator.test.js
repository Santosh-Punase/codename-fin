import express from 'express';

import { server, expect } from '../server.js';
import {
  categoryValidationRules,
  validateCategory,
} from '../../src/middleware/categoryValidator.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';

// Express setup for testing
const app = express();
app.use(express.json());

const SUCCESS_MESSAGE = 'validation successful';

app.post(
  '/test-category',
  categoryValidationRules,
  validateCategory,
  (_req, res) => res.status(200).send(SUCCESS_MESSAGE),
);

describe('Category Validator Middleware', () => {
  it('should fail if name is not provided', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ budget: 500 });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.CATEGORY_NAME_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_CATEGORY_NAME,
    });
  });

  it('should fail if amount is not a number', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ name: '  ', budget: 500 });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_CATEGORY_NAME,
      message: VALIDATION_ERROR.INVALID_CATEGORY_NAME,
    });
  });

  it('should fail if budget is not provided', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ name: 'Entertainment' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.BUDGET_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_BUDGET,
    });
  });

  it('should fail if budget is not valid', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ name: 'Entertainment', budget: '  ' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_BUDGET,
      message: VALIDATION_ERROR.INVALID_BUDGET,
    });
  });

  it('should fail if budget is not valid', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ name: 'Entertainment', budget: 'abc' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_BUDGET,
      message: VALIDATION_ERROR.INVALID_BUDGET,
    });
  });

  it('should pass if all fields are valid', async () => {
    const res = await server.request(app)
      .post('/test-category')
      .send({ name: 'Entertainment', budget: '100' });

    expect(res).to.have.status(200);
    expect(res.text).to.equal(SUCCESS_MESSAGE);
  });
});
