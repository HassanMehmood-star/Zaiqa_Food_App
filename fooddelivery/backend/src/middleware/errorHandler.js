const ApiError = require('../utils/ApiError');

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof ApiError) {
    return res.status(err.statusCode).json({
      error: {
        message: err.message,
        details: err.details || undefined,
      },
    });
  }

  // Postgres unique violation
  if (err.code === '23505') {
    return res.status(409).json({ error: { message: 'A record with these details already exists' } });
  }
  // Postgres foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ error: { message: 'Referenced record does not exist' } });
  }

  console.error(err);
  return res.status(500).json({ error: { message: 'Internal server error' } });
}

function notFoundHandler(req, res) {
  res.status(404).json({ error: { message: `Route not found: ${req.method} ${req.originalUrl}` } });
}

module.exports = { errorHandler, notFoundHandler };
