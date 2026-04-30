import bcryptjs from 'bcryptjs';
import { prisma } from '../../../lib/prisma';
import { sendResponse, sendError } from '../../../lib/utils/response';
import { withCORS } from '../../../lib/middleware/cors';
import { generateToken } from '../../../lib/utils/jwt';

const validatePasswordStrength = (password) => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/\d/.test(password)) return 'Password must contain at least one number';
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

const validatePhoneNumber = (phone) => {
  if (!phone) return null;
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length !== 11) return 'Phone number must be exactly 11 digits';
  return null;
};

async function handler(req, res) {
  if (req.method === 'POST') {
    await handleSignup(req, res);
    return;
  }

  res.setHeader('Allow', ['POST']);
  sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(handler);

async function handleSignup(req, res) {
  try {
    const { name, email, password, gender, dateOfBirth, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return sendError(res, 400, 'Name, email, and password are required');
    }

    // Validate password strength
    const passwordError = validatePasswordStrength(password);
    if (passwordError) {
      return sendError(res, 400, passwordError);
    }

    // Validate phone number if provided
    const phoneError = validatePhoneNumber(phone);
    if (phoneError) {
      return sendError(res, 400, phoneError);
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
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        phone,
      },
    });

    const token = generateToken(user.id);

    return sendResponse(res, 201, true, 'Account created successfully', {
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
    console.error('Signup error:', error);
    return sendError(res, 500, 'Registration failed', error.message);
  }
}
