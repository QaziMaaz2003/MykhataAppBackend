import bcryptjs from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { generateToken } from '../../../lib/utils/jwt';
import { sendResponse, sendError } from '../../../lib/utils/response';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    return handleSignup(req, res);
  }

  res.setHeader('Allow', ['POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleSignup(req, res) {
  try {
    const { name, email, password, gender, dateOfBirth, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    if (password.length < 6) {
      return sendError(res, 400, 'Password must be at least 6 characters');
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return sendError(res, 400, 'Email already registered');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        gender,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
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
    console.error('Signup error:', error);
    return sendError(res, 500, 'Failed to create user', error.message);
  }
}
