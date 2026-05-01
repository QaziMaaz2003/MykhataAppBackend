import { prisma } from '../../../lib/prisma';
import { withAuth } from '../../../lib/middleware/auth';
import { withCORS } from '../../../lib/middleware/cors';
import { sendResponse, sendError } from '../../../lib/utils/response';

async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    return handleUpdatePayment(req, res, id);
  }
  if (req.method === 'DELETE') {
    return handleDeletePayment(req, res, id);
  }

  res.setHeader('Allow', ['PUT', 'DELETE']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleUpdatePayment(req, res, id) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        iOweMoney: true,
        iAmOwedMoney: true,
      },
    });

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    const owner = payment.iOweMoney || payment.iAmOwedMoney;
    if (!owner || owner.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to update this payment');
    }

    const { amount, date, description, type, imageUrl } = req.body;

    const updatedPayment = await prisma.payment.update({
      where: { id },
      data: {
        ...(amount && { amount: parseFloat(amount) }),
        ...(date && { date: new Date(date) }),
        ...(description !== undefined && { description: description || null }),
        ...(type && { type }),
        ...(imageUrl !== undefined && { imageUrl: imageUrl || null }),
      },
    });

    return sendResponse(res, 200, true, 'Payment updated successfully', updatedPayment);
  } catch (error) {
    console.error('Update payment error:', error);
    return sendError(res, 500, 'Failed to update payment', error.message);
  }
}

async function handleDeletePayment(req, res, id) {
  try {
    const payment = await prisma.payment.findUnique({
      where: { id },
      include: {
        iOweMoney: true,
        iAmOwedMoney: true,
      },
    });

    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    const owner = payment.iOweMoney || payment.iAmOwedMoney;
    if (!owner || owner.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to delete this payment');
    }

    await prisma.payment.delete({ where: { id } });

    return sendResponse(res, 200, true, 'Payment deleted successfully', null);
  } catch (error) {
    console.error('Delete payment error:', error);
    return sendError(res, 500, 'Failed to delete payment', error.message);
  }
}

export default withCORS(withAuth(handler));
