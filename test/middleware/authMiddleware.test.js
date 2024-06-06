/* eslint-disable no-unused-expressions */
import sinon from 'sinon';
import jwt from 'jsonwebtoken';
import sinonChai from 'sinon-chai';
import { expect, use } from 'chai';

import protect from '../../src/middleware/authMiddleware.js';
import User from '../../src/models/User.js';
import { JWT_SECRET } from '../../src/config/env.js';
import { ERROR_CODES } from '../../src/const/errorCodes.js';
import { ERROR } from '../../src/const/errorMessages.js';

use(sinonChai);

describe('authentication middleware', () => {
  let request; let response; let next; let userFindByIdStub; let
    verifyStub;

  beforeEach(() => {
    request = {
      headers: {
        authorization: 'Bearer validtoken',
      },
    };
    response = {
      json: sinon.stub(),
      status: sinon.stub().returnsThis(), // Make status() chainable
    };
    next = sinon.stub();
    userFindByIdStub = sinon.stub(User, 'findById');
    verifyStub = sinon.stub(jwt, 'verify');
  });

  afterEach(() => {
    sinon.restore();
  });

  it('should return 401 if no token is provided', async () => {
    request.headers.authorization = null;

    await protect(request, response, next);

    expect(response.status).to.have.been.calledWith(401);
    expect(response.json).to.have.been.calledWith({
      error: {
        code: ERROR_CODES.NOT_AUTHORIZED,
        message: ERROR.NOT_AUTHORIZED,
      },
    });
    expect(next).not.to.have.been.called;
  });

  it('should return 401 if token verification fails', async () => {
    verifyStub.throws(new Error('Invalid token'));

    await protect(request, response, next);

    expect(response.status).to.have.been.calledWith(401);
    expect(response.json).to.have.been.calledWith({
      error: {
        code: ERROR_CODES.NOT_AUTHORIZED,
        message: ERROR.NOT_AUTHORIZED,
      },
    });
    expect(next).not.to.have.been.called;
  });

  it('should call next if token is valid and user is found', async () => {
    const decodedToken = { id: '123' };
    verifyStub.returns(decodedToken);
    userFindByIdStub.resolves({ id: 'userId', name: 'Test User' });

    await protect(request, response, next);

    expect(jwt.verify).to.have.been.calledWith('validtoken', JWT_SECRET);
    expect(userFindByIdStub).to.have.been.calledWith(decodedToken.id);
    expect(request.user).to.eql({ id: 'userId', name: 'Test User' });
    expect(next).to.have.been.called;
  });

  it('should handle exceptions during user fetching', async () => {
    verifyStub.returns({ id: '123' });
    userFindByIdStub.throws(new Error('DB Error'));

    await protect(request, response, next);

    expect(response.status.calledWith(401)).to.be.true;
    expect(response.json.calledWith({
      error: { code: ERROR_CODES.NOT_AUTHORIZED, message: ERROR.NOT_AUTHORIZED },
    })).to.be.true;
    expect(next).not.to.have.been.called;
  });
});
