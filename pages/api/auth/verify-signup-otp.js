import bcryptjs from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { generateToken } from '../../../lib/utils/jwt';
import { sendResponse, sendError } from '../../../lib/utils/response';
import { withCORS } from '../../../lib/middleware/cors';
import { verifyOTP } from '../../../lib/utils/otp';

async function handler(req, res) {
  if (req.method === 'POST') {
    await handleVerifySignupOTP(req, res);
    return;
  }

  res.setHeader('Allow', ['POST']);
  sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(handler);

async function handleVerifySignupOTP(req, res) {
  try {
    const { email, otp, tempToken } = req.body;

    if (!email || !otp || !tempToken) {
      return sendError(res, 400, 'Email, OTP, and temporary token are required');
    }

    // Verify OTP
    const otpVerification = await verifyOTP(email, otp, 'email_verification');

    if (!otpVerification.valid) {
      return sendError(res, 400, otpVerification.message);
    }

    // Decode temp token to get user data
    let signupData;
    try {
      // The tempToken is just a base64 encoded JSON for now
      signupData = JSON.parse(Buffer.from(tempToken, 'base64').toString());
    } catch (error) {
      return sendError(res, 400, 'Invalid temporary token');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: signupData.email },
    });

    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(signupData.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: signupData.name,
        email: signupData.email,
        password: hashedPassword,
        gender: signupData.gender,
        phone: signupData.phone,
        dateOfBirth: signupData.dateOfBirth ? new Date(signupData.dateOfBirth) : null,
      },
    });

    // Generate token
    const token = generateToken(user.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return sendResponse(res, 201, true, 'User registered successfully', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Verify signup OTP error:', error);
    return sendError(res, 500, 'Failed to verify OTP', error.message);
  }
}
