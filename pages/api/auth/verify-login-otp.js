import { prisma } from '../../../lib/prisma';
import { generateToken } from '../../../lib/utils/jwt';
import { sendResponse, sendError } from '../../../lib/utils/response';
import { withCORS } from '../../../lib/middleware/cors';
import { verifyOTP } from '../../../lib/utils/otp';

async function handler(req, res) {
  if (req.method === 'POST') {
    await handleVerifyLoginOTP(req, res);
    return;
  }

  res.setHeader('Allow', ['POST']);
  sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(handler);

async function handleVerifyLoginOTP(req, res) {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return sendError(res, 400, 'Email and OTP are required');
    }

    // Verify OTP
    const otpVerification = await verifyOTP(email, otp, 'login_verification');

    if (!otpVerification.valid) {
      return sendError(res, 400, otpVerification.message);
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    if (!user.isActive) {
      return sendError(res, 401, 'Account is inactive');
    }

    // Generate token
    const token = generateToken(user.id);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = user;

    return sendResponse(res, 200, true, 'Login successful', {
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error('Verify login OTP error:', error);
    return sendError(res, 500, 'Failed to verify OTP', error.message);
  }
}
