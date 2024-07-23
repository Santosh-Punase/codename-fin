import express from 'express';

import { server, expect } from '../server.js';
import limiter from '../../src/middleware/rateLimiter.js';
import { RATE_LIMIT_CONFIG } from '../../src/config/contants.js';

describe('Rate Limiter Middleware', () => {
  let app;
  let appServer;
  before(() => {
    app = express();

    app.use(limiter(RATE_LIMIT_CONFIG.MAX_REQUEST_TEST));

    // A sample route for testing
    app.get('/', (req, res) => {
      res.status(200).send('Hello, world!');
    });

    appServer = app.listen(3005);
  });

  after(() => {
    appServer.close();
  });

  it('should allow a request under the limit', (done) => {
    server.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(200);
        expect(res.text).to.equal('Hello, world!');
        done();
      });
  });

  it('should return a 429 status code when rate limit is exceeded', (done) => {
    server.request(app)
      .get('/')
      .end((err, res) => {
        expect(res).to.have.status(429);
        expect(res.body.message)
          .to.equal('Too many requests from this IP, please try again later.');
        done();
      });
  });
});
