import express from 'express';

import { server, expect } from '../server.js';
import {
  transactionValidationRules,
  validateTransaction,
} from '../../src/middleware/transactionValidator.js';
import { VALIDATION_ERROR } from '../../src/const/errorMessages.js';
import { VALIDATION_ERROR_CODES } from '../../src/const/errorCodes.js';
import { TRANSACTION_TYPE } from '../../src/config/contants.js';

// Express setup for testing
const app = express();
app.use(express.json());

const SUCCESS_MESSAGE = 'validation successful';

app.post(
  '/test-transaction',
  transactionValidationRules,
  validateTransaction,
  (_req, res) => res.status(200).send(SUCCESS_MESSAGE),
);

describe('Transaction Validator Middleware', () => {
  it('should fail if amount is not provided', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({ type: 'expense', category: '60d21b4667d0d8992e610c85' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.AMOUNT_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_AMOUNT,
    });
  });

  it('should fail if amount is not a number', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({ amount: 'not-a-number', type: 'expense', category: '60d21b4667d0d8992e610c85' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_AMOUNT,
      message: VALIDATION_ERROR.INVALID_AMOUNT,
    });
  });

  it('should fail if remark is not provided', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({ amount: 45, type: 'expense', category: '60d21b4667d0d8992e610c85' });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.REMARK_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_REMARK,
    });
  });

  it('should fail if remark is not valid', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45, remark: '  ', category: '60d21b4667d0d8992e610c85',
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_REMARK,
      message: VALIDATION_ERROR.INVALID_REMARK,
    });
  });

  it('should fail if type is not provided', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45, remark: 'remark', category: '60d21b4667d0d8992e610c85',
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.TRANSACTION_TYPE_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_TRANSACTION_TYPE,
    });
  });

  it('should fail if type is not valid', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45, remark: 'remark', type: 'expenditure', category: '60d21b4667d0d8992e610c85',
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.TRANSACTION_TYPE_IS_INVALID,
      message: VALIDATION_ERROR.INVALID_TRANSACTION_TYPE,
    });
  });

  it('should fail if category is not provided', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({ amount: 45, remark: 'remark', type: TRANSACTION_TYPE.EXPENSE });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.CATEGORY_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_CATEGORY,
    });
  });

  it('should fail if category is not a valid Mongo ID', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45, remark: 'remark', type: TRANSACTION_TYPE.EXPENSE, category: 'invalid',
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_CATEGORY,
      message: VALIDATION_ERROR.INVALID_CATEGORY,
    });
  });

  it('should fail if payment mode is not provided', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45,
        remark:
        'remark',
        category: '60d21b4667d0d8992e610c85',
        type: TRANSACTION_TYPE.EXPENSE,
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.PAYMENT_MODE_IS_REQUIRED,
      message: VALIDATION_ERROR.INVALID_PAYMENT_MODE,
    });
  });

  it('should fail if payment mode is not a valid Mongo ID', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 45,
        remark: 'remark',
        type: TRANSACTION_TYPE.EXPENSE,
        category: '60d21b4667d0d8992e610c85',
        paymentMode: 'invalid',
      });

    expect(res).to.have.status(400);
    expect(res.body.error).to.deep.equal({
      code: VALIDATION_ERROR_CODES.INVALID_PAYMENT_MODE,
      message: VALIDATION_ERROR.INVALID_PAYMENT_MODE,
    });
  });

  it('should pass if all fields are valid', async () => {
    const res = await server.request(app)
      .post('/test-transaction')
      .send({
        amount: 100,
        remark: 'remark',
        type: TRANSACTION_TYPE.EXPENSE,
        category: '60d21b4667d0d8992e610c85',
        paymentMode: '60d21b4667d0d8992e610a72',
      });

    expect(res).to.have.status(200);
    expect(res.text).to.equal(SUCCESS_MESSAGE);
  });
});
