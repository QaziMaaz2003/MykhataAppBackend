import jwt from 'jsonwebtoken';
import config from '../config/env.js';
import { sendError } from '../utils/response.js';

export const authMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return sendError(res, 401, 'No token provided');
    }

    const decoded = jwt.verify(token, config.jwtSecret);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return sendError(res, 401, 'Invalid or expired token');
  }
};

export default authMiddleware;
