import bcryptjs from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { sendResponse, sendError } from '../../../lib/utils/response';
import { withCORS } from '../../../lib/middleware/cors';
import { generateToken } from '../../../lib/utils/jwt';

async function handler(req, res) {
  if (req.method === 'POST') {
    await handleLogin(req, res);
    return;
  }

  res.setHeader('Allow', ['POST']);
  sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(handler);

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return sendError(res, 400, 'Email and password are required');
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return sendError(res, 400, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 400, 'Account is deactivated');
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return sendError(res, 400, 'Invalid email or password');
    }

    const token = generateToken(user.id);

    return sendResponse(res, 200, true, 'Login successful', {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        phone: user.phone,
      },
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    return sendError(res, 500, 'Login failed', error.message);
  }
}
