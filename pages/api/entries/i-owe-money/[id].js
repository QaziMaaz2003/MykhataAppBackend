import { prisma } from '../../../../lib/prisma';
import { withAuth } from '../../../../lib/middleware/auth';
import { withCORS } from '../../../../lib/middleware/cors';
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
  if (req.method === 'POST') {
    return handleRecordPayment(req, res, id);
  }

  res.setHeader('Allow', ['GET', 'PUT', 'DELETE', 'POST']);
  return sendError(res, 405, `Method ${req.method} Not Allowed`);
}

async function handleGetEntry(req, res, id) {
  try {
    const entry = await prisma.iOweMoney.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    if (!entry) {
      return sendError(res, 404, 'Entry not found');
    }

    if (entry.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to view this entry');
    }

    // Calculate totalPaid, totalAdditionalDebt and remaining
    const totalPaid = entry.payments
      .filter(p => p.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalAdditionalDebt = entry.payments
      .filter(p => p.type === 'additional_debt')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const remaining = entry.amount + totalAdditionalDebt - totalPaid;

    return sendResponse(res, 200, true, 'Entry retrieved', {
      ...entry,
      totalPaid,
      totalAdditionalDebt,
      remaining,
    });
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

    // Update entry including amount
    const updatedEntry = await prisma.iOweMoney.update({
      where: { id },
      data: {
        ...(personName && { personName }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(date && { date: new Date(date) }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(phoneNumber && { phoneNumber }),
        ...(billImageUrl !== undefined && { billImageUrl: billImageUrl || null }),
        ...(description && { description }),
        ...(status && { status }),
      },
      include: {
        payments: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    // Calculate totalPaid, totalAdditionalDebt and remaining
    const totalPaid = updatedEntry.payments
      .filter(p => p.type === 'payment')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const totalAdditionalDebt = updatedEntry.payments
      .filter(p => p.type === 'additional_debt')
      .reduce((sum, payment) => sum + payment.amount, 0);
    
    const remaining = updatedEntry.amount + totalAdditionalDebt - totalPaid;

    return sendResponse(res, 200, true, 'Entry updated successfully', {
      ...updatedEntry,
      totalPaid,
      totalAdditionalDebt,
      remaining,
    });
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

async function handleRecordPayment(req, res, id) {
  try {
    const entry = await prisma.iOweMoney.findUnique({
      where: { id },
    });

    if (!entry) {
      return sendError(res, 404, 'Entry not found');
    }

    if (entry.userId !== req.userId) {
      return sendError(res, 403, 'Not authorized to record payment for this entry');
    }

    const { amount, date, description, type = 'payment', imageUrl } = req.body;

    if (!amount || amount <= 0) {
      return sendError(res, 400, 'Payment amount must be a positive number');
    }

    // Validate type
    if (!['payment', 'additional_debt'].includes(type)) {
      return sendError(res, 400, 'Type must be "payment" or "additional_debt"');
    }

    // Create a new payment record
    const payment = await prisma.payment.create({
      data: {
        iOweMoney: { connect: { id } },
        amount: parseFloat(amount),
        type,
        date: date ? new Date(date) : new Date(),
        description,
        ...(imageUrl && { imageUrl }),
      },
    });

    // Fetch updated entry with all payments
    const updatedEntry = await prisma.iOweMoney.findUnique({
      where: { id },
      include: {
        payments: {
          orderBy: {
            date: 'asc',
          },
        },
      },
    });

    // Calculate totalPaid and totalAdditionalDebt
    const totalPaid = updatedEntry.payments
      .filter(p => p.type === 'payment')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const totalAdditionalDebt = updatedEntry.payments
      .filter(p => p.type === 'additional_debt')
      .reduce((sum, p) => sum + p.amount, 0);
    
    const remaining = updatedEntry.amount + totalAdditionalDebt - totalPaid;

    return sendResponse(res, 201, true, 'Transaction recorded successfully', {
      payment,
      entry: {
        ...updatedEntry,
        totalPaid,
        totalAdditionalDebt,
        remaining,
      },
    });
  } catch (error) {
    console.error('Record payment error:', error);
    return sendError(res, 500, 'Failed to record payment', error.message);
  }
}

export default withCORS(withAuth(handler));
