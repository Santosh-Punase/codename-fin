import rateLimit from 'express-rate-limit';

import { RATE_LIMIT_CONFIG } from '../config/contants.js';

const limiter = (maxRequest = RATE_LIMIT_CONFIG.MAX_REQUEST) => rateLimit({
  windowMs: RATE_LIMIT_CONFIG.WINDOW_MS,
  max: maxRequest,
  handler: (_req, res, _next, options) => (
    res.status(options.statusCode).send({ message: RATE_LIMIT_CONFIG.MESSAGE })
  ),
});

export default limiter;
