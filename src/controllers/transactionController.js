import { sendResponse, sendError } from '../utils/response.js';
import { asyncHandler } from '../utils/errors.js';

/**
 * Get all transactions
 */
export const getTransactions = asyncHandler(async (req, res) => {
  sendResponse(res, 200, true, 'Transactions retrieved', []);
});

/**
 * Create a new transaction
 */
export const createTransaction = asyncHandler(async (req, res) => {
  sendResponse(res, 201, true, 'Transaction created', null);
});

/**
 * Get transaction by ID
 */
export const getTransactionById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction retrieved', { id });
});

/**
 * Update transaction
 */
export const updateTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction updated', { id });
});

/**
 * Delete transaction
 */
export const deleteTransaction = asyncHandler(async (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction deleted', null);
});

export default {
  getTransactions,
  createTransaction,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
};
