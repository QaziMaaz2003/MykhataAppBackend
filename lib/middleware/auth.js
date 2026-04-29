import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const authMiddleware = (handler) => {
  return (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return sendError(res, 401, 'No token provided');
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return sendError(res, 401, 'Invalid or expired token');
      }

      req.userId = decoded.id;
      return handler(req, res);
    } catch (error) {
      return sendError(res, 401, 'Authentication failed');
    }
  };
};
