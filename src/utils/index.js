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

export const getTransactionDateFilters = (period, startDate, endDate) => {
  if (!period && !startDate && !endDate) {
    return {};
  }

  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  // Handle different periods: this week, last week, this month, last month, this year
  switch (period) {
    case 'thisWeek':
    {
      const startOfWeek = new Date(currentDate);
      // Set to Sunday of this week
      startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
      return {
        $gte: startOfWeek,
        $lte: new Date(),
      };
    }
    case 'lastWeek':
    {
      const startOfLastWeek = new Date(currentDate);
      // Set to Sunday of last week
      startOfLastWeek.setDate(currentDate.getDate() - currentDate.getDay() - 7);
      const endOfLastWeek = new Date(currentDate);
      // Set to Saturday of last week
      endOfLastWeek.setDate(startOfLastWeek.getDate() + 7);
      return {
        $gte: startOfLastWeek,
        $lte: endOfLastWeek,
      };
    }
    case 'thisMonth':
    {
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      return {
        $gte: startOfMonth,
        $lte: new Date(),

      };
    }
    case 'lastMonth':
    {
      const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const endOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);
      return {
        $gte: startOfLastMonth,
        $lte: endOfLastMonth,
      };
    }
    case 'thisYear':
    {
      const startOfYear = new Date(currentDate.getFullYear(), 0, 1);
      return {
        $gte: startOfYear,
        $lte: new Date(),
      };
    }
    default:
      // Handle custom date range
      if (startDate && endDate) {
        return {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        };
      }
      return {};
  }
};
