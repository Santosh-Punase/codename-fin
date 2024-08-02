import { createTransport } from 'nodemailer';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';

import {
  NODE_ENV, VERIFIER_MAIL_ID, VERIFIER_PASS, VERIFIER_PROVIDER, VERIFIER_PORT,
  JWT_SECRET,
} from '../config/env.js';

export const isTestEnv = () => NODE_ENV === 'test';

export const transporter = createTransport({
  host: VERIFIER_PROVIDER,
  port: VERIFIER_PORT,
  auth: {
    user: VERIFIER_MAIL_ID,
    pass: VERIFIER_PASS,
  },
});

export const generateOTP = () => crypto.randomInt(100000, 999999);

export const generateToken = (id, expiresIn = '1h') => jwt.sign({ id }, JWT_SECRET, { expiresIn });
