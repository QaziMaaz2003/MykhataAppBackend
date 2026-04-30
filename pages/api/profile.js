import { prisma } from '../../lib/prisma';
import { sendResponse, sendError } from '../../lib/utils/response';
import { withCORS } from '../../lib/middleware/cors';
import { withAuth } from '../../lib/middleware/auth';
import bcryptjs from 'bcryptjs';

async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetProfile(req, res);
  } else if (req.method === 'PUT') {
    return handleUpdateProfile(req, res);
  } else if (req.method === 'POST') {
    return handleChangePassword(req, res);
  }

  res.setHeader('Allow', ['GET', 'PUT', 'POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

export default withCORS(withAuth(handler));

async function handleGetProfile(req, res) {
  try {
    const userId = req.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
        createdAt: true,
      },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    return sendResponse(res, 200, true, 'Profile retrieved successfully', { user });
  } catch (error) {
    console.error('Get profile error:', error);
    return sendError(res, 500, 'Failed to fetch profile', error.message);
  }
}

async function handleUpdateProfile(req, res) {
  try {
    const userId = req.userId;
    const { name, phone, gender, dateOfBirth } = req.body;

    if (!name && !phone && !gender && !dateOfBirth) {
      return sendError(res, 400, 'At least one field is required to update');
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (gender) updateData.gender = gender;
    if (dateOfBirth) updateData.dateOfBirth = new Date(dateOfBirth);

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        gender: true,
        dateOfBirth: true,
      },
    });

    return sendResponse(res, 200, true, 'Profile updated successfully', { user });
  } catch (error) {
    console.error('Update profile error:', error);
    return sendError(res, 500, 'Failed to update profile', error.message);
  }
}

async function handleChangePassword(req, res) {
  try {
    const userId = req.userId;
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // Validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return sendError(res, 400, 'Old password, new password, and confirmation are required');
    }

    if (newPassword.length < 6) {
      return sendError(res, 400, 'New password must be at least 6 characters');
    }

    if (newPassword !== confirmPassword) {
      return sendError(res, 400, 'New passwords do not match');
    }

    if (oldPassword === newPassword) {
      return sendError(res, 400, 'New password must be different from old password');
    }

    // Get current user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return sendError(res, 404, 'User not found');
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);

    if (!isPasswordValid) {
      return sendError(res, 400, 'Old password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return sendResponse(res, 200, true, 'Password changed successfully');
  } catch (error) {
    console.error('Change password error:', error);
    return sendError(res, 500, 'Failed to change password', error.message);
  }
}
