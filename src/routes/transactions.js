import express from 'express';
import { sendResponse } from '../utils/response.js';

const router = express.Router();

/**
 * GET /api/transactions
 * Get all transactions
 */
router.get('/', (req, res) => {
  sendResponse(res, 200, true, 'Transactions retrieved', []);
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', (req, res) => {
  sendResponse(res, 201, true, 'Transaction created', null);
});

/**
 * GET /api/transactions/:id
 * Get transaction by ID
 */
router.get('/:id', (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction retrieved', { id });
});

/**
 * PUT /api/transactions/:id
 * Update transaction
 */
router.put('/:id', (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction updated', { id });
});

/**
 * DELETE /api/transactions/:id
 * Delete transaction
 */
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  sendResponse(res, 200, true, 'Transaction deleted', null);
});

export default router;
