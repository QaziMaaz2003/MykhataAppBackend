import { connectDB } from '../../lib/db.js';
import Transaction from '../../lib/models/Transaction.js';
import { sendResponse, sendError } from '../../lib/utils/response.js';

export default async function handler(req, res) {
  await connectDB();

  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGetTransactions(req, res);
      case 'POST':
        return handleCreateTransaction(req, res);
      default:
        res.setHeader('Allow', ['GET', 'POST']);
        return sendError(res, 405, `Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    return sendError(res, 500, 'Internal Server Error', error.message);
  }
}

async function handleGetTransactions(req, res) {
  try {
    const transactions = await Transaction.find().populate('userId', 'name email');
    return sendResponse(res, 200, true, 'Transactions retrieved', transactions);
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve transactions', error.message);
  }
}

async function handleCreateTransaction(req, res) {
  try {
    const { userId, type, amount, description, category, date } = req.body;

    if (!userId || !type || !amount) {
      return sendError(res, 400, 'Missing required fields');
    }

    const transaction = new Transaction({
      userId,
      type,
      amount,
      description,
      category,
      date,
    });

    await transaction.save();
    return sendResponse(res, 201, true, 'Transaction created', transaction);
  } catch (error) {
    return sendError(res, 400, 'Failed to create transaction', error.message);
  }
}
