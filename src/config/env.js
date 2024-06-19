import dotenv from 'dotenv';

dotenv.config();

export const { JWT_SECRET } = process.env;
export const { JWT_EXPIRY } = process.env;
export const { DB_URI } = process.env;
export const { DB_URI_TEST } = process.env;
export const { NODE_ENV } = process.env;
export const { PORT } = process.env;
export const { TEST_USER_NAME } = process.env;
export const { TEST_USER_EMAIL } = process.env;
export const { TEST_USER_PASSWORD } = process.env;
export const { CORS_DOMAIN } = process.env;
