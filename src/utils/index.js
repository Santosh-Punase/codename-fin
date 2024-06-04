import { NODE_ENV } from '../config/env.js';

// eslint-disable-next-line import/prefer-default-export
export const isTestEnv = () => NODE_ENV === 'test';
