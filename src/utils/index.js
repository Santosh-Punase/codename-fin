import { NODE_ENV } from '../config/env.js';

export const isTestEnv = () => NODE_ENV === 'test';

export const isDevEnv = () => NODE_ENV === 'development';
