/**
 * API response utility
 */
export const sendResponse = (res, statusCode, success, message, data = null) => {
  return res.status(statusCode).json({
    success,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

/**
 * Error response utility
 */
export const sendError = (res, statusCode, message, error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    error: error && process.env.NODE_ENV === 'development' ? error : undefined,
    timestamp: new Date().toISOString(),
  });
};
