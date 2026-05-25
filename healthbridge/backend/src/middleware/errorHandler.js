class AppError extends Error {
  constructor(message, statusCode = 500, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    this.details = details;
  }
}

function errorHandler(err, req, res, next) {
  const logger = require('../utils/logger');

  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let details = err.details || null;

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = 'Validation error';
    details = err.errors.map((e) => ({ field: e.path.join('.'), message: e.message }));
  }

  // PostgreSQL unique violation
  if (err.code === '23505') {
    statusCode = 409;
    message = 'Record already exists';
  }

  // PostgreSQL FK violation
  if (err.code === '23503') {
    statusCode = 400;
    message = 'Referenced record not found';
  }

  if (process.env.NODE_ENV !== 'production' || statusCode >= 500) {
    logger.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && statusCode >= 500 && { stack: err.stack }),
  });
}

module.exports = { AppError, errorHandler };
