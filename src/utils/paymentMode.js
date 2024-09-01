import { PAYMENT_MODE_TYPE } from '../config/contants.js';

// eslint-disable-next-line import/prefer-default-export
export const isBankLinkedPaymentMode = (pmodeType) => pmodeType === PAYMENT_MODE_TYPE.BANK;
