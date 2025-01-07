import OTP from '../models/OTP.js';
import User from '../models/User.js';

import logger from '../utils/logger.js';
import { VERIFIER_MAIL_ID } from '../config/env.js';
import { ERROR_CODES, VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { ERROR, VALIDATION_ERROR } from '../const/errorMessages.js';
import { generateOTP, generateToken, transporter } from '../utils/index.js';

export const sendOtp = async (req, res) => {
  const { email, flow } = req.body;
  const user = await User.findOne({ email });

  // 'forgotPassword' | 'signup'
  if (flow === 'signup' && user) {
    return res.status(400).json({
      error: {
        code: VALIDATION_ERROR_CODES.EMAIL_ALREADY_EXISTS,
        message: VALIDATION_ERROR.EMAIL_ALREADY_EXISTS,
      },
    });
  }
  if (flow === 'forgotPassword' && !user) {
    return res.status(400).json({
      error: {
        code: VALIDATION_ERROR_CODES.EMAIL_DOES_NOT_EXISTS,
        message: VALIDATION_ERROR.EMAIL_DOES_NOT_EXISTS,
      },
    });
  }

  const currentDate = new Date();

  const otpData = await OTP.findOne({ email });

  let requestCount = otpData?.requestCount || 1;
  if (otpData) {
    const endOfFrozenTime = new Date(otpData.expiresAt);
    endOfFrozenTime.setHours(endOfFrozenTime.getHours() + 24);
    if (currentDate < endOfFrozenTime) {
      if (otpData.requestCount >= 3) {
        logger.error(`Unable to send OTP ${email}: Maximum tries reached for day`);
        return res.status(429).json({
          error: {
            code: ERROR_CODES.ACCOUNT_LOCKED_FOR_THE_DAY, message: ERROR.ACCOUNT_LOCKED_FOR_THE_DAY,
          },
        });
      }
      requestCount += 1;
    } else {
      requestCount = 1;
    }
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 60 * 2000); // 2 minute expiry

  if (otpData) {
    otpData.otp = otp;
    otpData.expiresAt = expiresAt;
    otpData.requestCount = requestCount;
    await otpData.save();
  } else {
    await OTP.create({
      email, otp, expiresAt, requestCount,
    });
  }

  const mailOptions = {
    from: `"FinoVeu 🚀" <${VERIFIER_MAIL_ID}>`,
    to: email,
    subject: 'FinoVeu | OTP for Email Verification',
    text: `Dear User, \n\n
    Greetings !!!\n\n
    As you requested, your OTP for email verification : ${otp}.
    \n\n
    Thanks
    Team FinoVeu`,
  };

  return transporter.sendMail(mailOptions, (error) => {
    if (error) {
      logger.error(`Unable to send OTP ${email}: ${error}`);
      return res.status(500).json({
        error: {
          code: ERROR_CODES.FAILED_TO_SEND_OTP, message: ERROR.FAILED_TO_SEND_OTP,
        },
      });
    }
    logger.info(`OTP sent to ${email}`);
    return res.send('OTP sent');
  });
};

export const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  const otpData = await OTP.findOne({ email });

  if (!otpData) {
    logger.error(`Unable to send OTP ${email}: No OTP found`);
    return res.status(400).json({
      error: {
        code: VALIDATION_ERROR_CODES.INVALID_OTP,
        message: VALIDATION_ERROR.INVALID_OTP,
      },
    });
  }

  if (otpData.expiresAt < new Date()) {
    logger.error(`Unable to verify OTP ${email}: OTP Expired at ${otpData.expiresAt}`);
    return res.status(400).json({
      error: {
        code: VALIDATION_ERROR_CODES.OTP_EXPIRED,
        message: VALIDATION_ERROR.OTP_EXPIRED,
      },
    });
  }

  if (otpData.otp === parseInt(otp, 10)) {
    await OTP.deleteOne({ email }); // OTP is used, remove it
    logger.info(`OTP verified successfully ${email}`);

    const user = await User.findOne({ email });
    let token;
    if (user) {
      token = generateToken(user._id);
    }
    if (token) {
      return res.status(200).json({ token });
    }
    return res.send('OTP verified successfully');
  }

  logger.error(`Unable to verify OTP ${email}: Invalid OTP ${otp}`);
  return res.status(400).json({
    error: {
      code: VALIDATION_ERROR_CODES.INVALID_OTP,
      message: VALIDATION_ERROR.INVALID_OTP,
    },
  });
};
