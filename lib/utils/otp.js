import { prisma } from '../prisma.js';

// Generate a 6-digit OTP
export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Save OTP to database
export const saveOTP = async (email, otp, userId = null, type = 'email_verification') => {
  try {
    // Invalidate previous unused OTPs for this email
    await prisma.otp.updateMany({
      where: {
        email,
        isUsed: false,
        type,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new OTP (10 minutes expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const savedOTP = await prisma.otp.create({
      data: {
        email,
        otp,
        type,
        userId,
        expiresAt,
      },
    });

    return savedOTP;
  } catch (error) {
    console.error('Error saving OTP:', error);
    throw error;
  }
};

// Verify OTP
export const verifyOTP = async (email, otp, type = 'email_verification') => {
  try {
    const otpRecord = await prisma.otp.findFirst({
      where: {
        email,
        otp,
        type,
        isUsed: false,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!otpRecord) {
      return {
        valid: false,
        message: 'Invalid or expired OTP',
      };
    }

    // Mark OTP as used
    await prisma.otp.update({
      where: { id: otpRecord.id },
      data: { isUsed: true },
    });

    return {
      valid: true,
      message: 'OTP verified successfully',
      userId: otpRecord.userId,
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

// Resend OTP
export const resendOTP = async (email, newOTP, type = 'email_verification') => {
  try {
    // Invalidate previous unused OTPs
    await prisma.otp.updateMany({
      where: {
        email,
        isUsed: false,
        type,
      },
      data: {
        isUsed: true,
      },
    });

    // Create new OTP (10 minutes expiry)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    const savedOTP = await prisma.otp.create({
      data: {
        email,
        otp: newOTP,
        type,
        expiresAt,
      },
    });

    return savedOTP;
  } catch (error) {
    console.error('Error resending OTP:', error);
    throw error;
  }
};
