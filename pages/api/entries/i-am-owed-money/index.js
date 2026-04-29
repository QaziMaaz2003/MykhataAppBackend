import { prisma } from '../../../lib/prisma';
import { withAuth } from '../../../lib/middleware/auth';
import { sendResponse, sendError } from '../../../lib/utils/response';

async function handler(req, res) {
  if (req.method === 'GET') {
    return handleGetEntries(req, res);
  }
  if (req.method === 'POST') {
    return handleCreateEntry(req, res);
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleGetEntries(req, res) {
  try {
    const entries = await prisma.iAmOwedMoney.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const total = entries.reduce((sum, entry) => sum + entry.amount, 0);

    return sendResponse(res, 200, true, 'Entries retrieved', {
      entries,
      total,
      count: entries.length,
    });
  } catch (error) {
    console.error('Get entries error:', error);
    return sendError(res, 500, 'Failed to retrieve entries', error.message);
  }
}

async function handleCreateEntry(req, res) {
  try {
    const { personName, amount, date, dueDate, phoneNumber, billImageUrl, description } = req.body;

    if (!personName || !amount || !date) {
      return sendError(res, 400, 'Person name, amount, and date are required');
    }

    const entry = await prisma.iAmOwedMoney.create({
      data: {
        userId: req.userId,
        personName,
        amount: parseFloat(amount),
        date: new Date(date),
        dueDate: dueDate ? new Date(dueDate) : null,
        phoneNumber,
        billImageUrl,
        description,
      },
    });

    return sendResponse(res, 201, true, 'Entry created successfully', entry);
  } catch (error) {
    console.error('Create entry error:', error);
    return sendError(res, 500, 'Failed to create entry', error.message);
  }
}

export default withAuth(handler);
