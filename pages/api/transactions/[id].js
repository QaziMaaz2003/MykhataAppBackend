import { connectDB } from '../../../lib/db.js';
import Transaction from '../../../lib/models/Transaction.js';
import { sendResponse, sendError } from '../../../lib/utils/response.js';

export default async function handler(req, res) {
  await connectDB();

  const { id } = req.query;
  const { method } = req;

  try {
    switch (method) {
      case 'GET':
        return handleGetTransaction(req, res, id);
      case 'PUT':
        return handleUpdateTransaction(req, res, id);
      case 'DELETE':
        return handleDeleteTransaction(req, res, id);
      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return sendError(res, 405, `Method ${method} Not Allowed`);
    }
  } catch (error) {
    console.error('Error:', error);
    return sendError(res, 500, 'Internal Server Error', error.message);
  }
}

async function handleGetTransaction(req, res, id) {
  try {
    const transaction = await Transaction.findById(id).populate('userId', 'name email');
    
    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendResponse(res, 200, true, 'Transaction retrieved', transaction);
  } catch (error) {
    return sendError(res, 500, 'Failed to retrieve transaction', error.message);
  }
}

async function handleUpdateTransaction(req, res, id) {
  try {
    const updates = req.body;
    const transaction = await Transaction.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendResponse(res, 200, true, 'Transaction updated', transaction);
  } catch (error) {
    return sendError(res, 400, 'Failed to update transaction', error.message);
  }
}

async function handleDeleteTransaction(req, res, id) {
  try {
    const transaction = await Transaction.findByIdAndDelete(id);

    if (!transaction) {
      return sendError(res, 404, 'Transaction not found');
    }

    return sendResponse(res, 200, true, 'Transaction deleted', null);
  } catch (error) {
    return sendError(res, 500, 'Failed to delete transaction', error.message);
  }
}
