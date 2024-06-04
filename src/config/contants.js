export const SALT_ROUND = 10;

export const RATE_LIMIT_CONFIG = {
  WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  MAX_REQUEST: 20, // limit each IP to 100 requests per windowMs
  MAX_REQUEST_TEST: 1,
  MESSAGE: 'Too many requests from this IP, please try again later.',
};
