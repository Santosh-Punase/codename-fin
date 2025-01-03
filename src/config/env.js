import dotenv from 'dotenv';

dotenv.config();

export const { JWT_SECRET } = process.env;
export const { JWT_EXPIRY = '1h' } = process.env;
export const { DB_URI } = process.env;
export const { DB_URI_TEST } = process.env;
export const { NODE_ENV } = process.env;
export const { PORT } = process.env;
export const { TEST_USER_NAME } = process.env;
export const { TEST_USER_EMAIL } = process.env;
export const { TEST_USER_PASSWORD } = process.env;
export const { CORS_DOMAIN } = process.env;
export const { VERIFIER_MAIL_ID } = process.env;
export const { VERIFIER_PASS } = process.env;
export const { VERIFIER_PROVIDER } = process.env;
export const { VERIFIER_PORT } = process.env;
export const { PACKAGE_NAME } = process.env;
export const { SERVICE_KEY } = process.env;
export const { GOOGLE_CLIENT_ID } = process.env;
export const { GOOGLE_CLIENT_SECRET } = process.env;
export const { CALLBACK_URL } = process.env;
