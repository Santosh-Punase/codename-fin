import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { JWT_SECRET } from '../config/env.js';
import { parseCookies } from '../utils/cookies.js';
import { TOKEN_VARIABLE } from '../config/contants.js';

const protect = async (req, res, next) => {
  const cookies = parseCookies(req);
  const { [TOKEN_VARIABLE]: token } = cookies;

  if (!token) {
    return res.status(401)
      .json({ error: { code: ERROR_CODES.NOT_AUTHORIZED, message: ERROR.NOT_AUTHORIZED } });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = await User.findById(decoded.id);
    return next();
  } catch (err) {
    return res.status(401)
      .json({ error: { code: ERROR_CODES.NOT_AUTHORIZED, message: ERROR.NOT_AUTHORIZED } });
  }
};

export default protect;
