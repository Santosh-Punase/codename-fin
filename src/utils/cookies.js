import { parse, serialize } from 'cookie';
import { TOKEN_COOKIE_MAX_AGE, TOKEN_VARIABLE } from '../config/contants.js';
import { isDevEnv } from './index.js';

function parseCookies(req) {
  return parse(req.headers.cookie || '');
}

function serializeCookie(token) {
  return serialize(TOKEN_VARIABLE, token, {
    httpOnly: true,
    secure: !isDevEnv,
    sameSite: 'strict',
    maxAge: TOKEN_COOKIE_MAX_AGE,
    path: '/',
  });
}

export { parseCookies, serializeCookie };
