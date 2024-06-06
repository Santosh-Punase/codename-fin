import jwt from 'jsonwebtoken';

import User from '../models/User.js';
import { ERROR_CODES } from '../const/errorCodes.js';
import { ERROR } from '../const/errorMessages.js';
import { JWT_SECRET } from '../config/env.js';

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    [, token] = req.headers.authorization.split(' ');
  }

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
