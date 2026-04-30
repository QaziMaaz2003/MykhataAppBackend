import { sendResponse, sendError } from '../../../lib/utils/response';
import { withCORS } from '../../../lib/middleware/cors';
import { generateOTP, resendOTP } from '../../../lib/utils/otp';
import { sendOTPEmail } from '../../../lib/utils/sendgrid';

async function handler(req, res) {
  if (req.method === 'POST') {
    await handleResendOTP(req, res);
    return;
  }

  res.setHeader('Allow', ['POST']);
  sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(handler);

async function handleResendOTP(req, res) {
  try {
    const { email, type = 'email_verification' } = req.body;

    if (!email) {
      return sendError(res, 400, 'Email is required');
    }

    // Generate new OTP
    const otp = generateOTP();

    // Save OTP to database
    await resendOTP(email, otp, type);

    // Send OTP via email
    await sendOTPEmail(email, otp);

    return sendResponse(res, 200, true, 'OTP sent successfully', {
      message: 'Check your email for the verification code',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    return sendError(res, 500, 'Failed to send OTP', error.message);
  }
}
