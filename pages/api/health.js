import { sendResponse } from '../utils/response.js';

export default function handler(req, res) {
  if (req.method === 'GET') {
    return sendResponse(res, 200, true, 'Server is running', {
      uptime: process.uptime(),
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  }

  res.setHeader('Allow', ['GET']);
  return res.status(405).end(`Method ${req.method} Not Allowed`);
}
