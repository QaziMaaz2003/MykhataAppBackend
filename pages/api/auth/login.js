import bcryptjs from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { generateToken } from '../../../lib/utils/jwt';
import { sendResponse, sendError } from '../../../lib/utils/response';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleLogin(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

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
      return sendError(res, 401, 'Invalid email or password');
    }

    // Check if user is active
    if (!user.isActive) {
      return sendError(res, 401, 'Account is deactivated');
    }

    // Compare passwords
    const passwordMatch = await bcryptjs.compare(password, user.password);

    if (!passwordMatch) {
      return sendError(res, 401, 'Invalid email or password');
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
    console.error('Login error:', error);
    return sendError(res, 500, 'Failed to login', error.message);
  }
}
