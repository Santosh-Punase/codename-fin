import OTP from '../models/OTP.js';
import logger from '../utils/logger.js';
import { VERIFIER_MAIL_ID } from '../config/env.js';
import { ERROR_CODES, VALIDATION_ERROR_CODES } from '../const/errorCodes.js';
import { ERROR, VALIDATION_ERROR } from '../const/errorMessages.js';
import { generateOTP, transporter } from '../utils/index.js';

export const sendOtp = async (req, res) => {
  const { email } = req.body;

  const currentDate = new Date();
  const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

  const otpData = await OTP.findOne({ email, date: { $gte: startOfDay, $lt: endOfDay } });
  if (otpData && otpData.requestCount >= 3) {
    logger.error(`Unable to send OTP ${email}: Maximum tries reached for day`);
    return res.status(429).json({
      error: {
        code: ERROR_CODES.ACCOUNT_LOCKED_FOR_THE_DAY, message: ERROR.ACCOUNT_LOCKED_FOR_THE_DAY,
      },
    });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 60 * 1000); // 1 minute expiry

  if (otpData) {
    otpData.otp = otp;
    otpData.expiresAt = expiresAt;
    otpData.requestCount += 1;
    await otpData.save();
  } else {
    await OTP.create({
      email, otp, expiresAt, requestCount: 1,
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
    logger.error(`Unable to send OTP ${email}: OTP Expired at ${otpData.expiresAt}`);
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
    return res.send('OTP verified successfully');
  }

  logger.error(`Unable to send OTP ${email}: Invalid OTP ${otp}`);
  return res.status(400).json({
    error: {
      code: VALIDATION_ERROR_CODES.INVALID_OTP,
      message: VALIDATION_ERROR.INVALID_OTP,
    },
  });
};
