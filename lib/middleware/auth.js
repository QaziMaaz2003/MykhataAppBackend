import { verifyToken } from '../utils/jwt.js';
import { sendError } from '../utils/response.js';

export const withAuth = (handler) => {
  return async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];

      if (!token) {
        return sendError(res, 401, 'No authorization token provided');
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return sendError(res, 401, 'Invalid or expired token');
      }

      req.userId = decoded.userId;
      return handler(req, res);
    } catch (error) {
      console.error('Auth middleware error:', error);
      return sendError(res, 401, 'Authentication failed');
    }
  };
};

export const authMiddleware = withAuth;

export default withAuth;
