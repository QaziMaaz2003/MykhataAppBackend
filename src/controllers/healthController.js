import { sendResponse } from '../utils/response.js';

/**
 * Health check controller
 */
export const getHealth = (req, res) => {
  sendResponse(res, 200, true, 'Server is running', {
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};

export default { getHealth };
