import { prisma } from '../../../../lib/prisma';
import { withAuth } from '../../../../lib/middleware/auth';
import { sendResponse, sendError } from '../../../../lib/utils/response';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'GET') {
    return handleGetEntry(req, res, id);
  }
  if (req.method === 'PUT') {
    return handleUpdateEntry(req, res, id);
  }
  if (req.method === 'DELETE') {
    return handleDeleteEntry(req, res, id);
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleGetEntry(req, res, id) {
  try {
    const entry = await prisma.iOweMoney.findUnique({
      where: { id },
    });

    if (!entry) {
      return sendError(res, 404, 'Entry not found');
    }

    if (entry.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to view this entry');
    }

    return sendResponse(res, 200, true, 'Entry retrieved', entry);
  } catch (error) {
    console.error('Get entry error:', error);
    return sendError(res, 500, 'Failed to retrieve entry', error.message);
  }
}

async function handleUpdateEntry(req, res, id) {
  try {
    const entry = await prisma.iOweMoney.findUnique({
      where: { id },
    });

    if (!entry) {
      return sendError(res, 404, 'Entry not found');
    }

    if (entry.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to update this entry');
    }

    const { personName, amount, date, dueDate, phoneNumber, billImageUrl, description, status } = req.body;

    const updatedEntry = await prisma.iOweMoney.update({
      where: { id },
      data: {
        ...(personName && { personName }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(date && { date: new Date(date) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(phoneNumber && { phoneNumber }),
        ...(billImageUrl && { billImageUrl }),
        ...(description && { description }),
        ...(status && { status }),
      },
    });

    return sendResponse(res, 200, true, 'Entry updated successfully', updatedEntry);
  } catch (error) {
    console.error('Update entry error:', error);
    return sendError(res, 500, 'Failed to update entry', error.message);
  }
}

async function handleDeleteEntry(req, res, id) {
  try {
    const entry = await prisma.iOweMoney.findUnique({
      where: { id },
    });

    if (!entry) {
      return sendError(res, 404, 'Entry not found');
    }

    if (entry.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to delete this entry');
    }

    await prisma.iOweMoney.delete({
      where: { id },
    });

    return sendResponse(res, 200, true, 'Entry deleted successfully', null);
  } catch (error) {
    console.error('Delete entry error:', error);
    return sendError(res, 500, 'Failed to delete entry', error.message);
  }
}

export default withAuth(handler);
