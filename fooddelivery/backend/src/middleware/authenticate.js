const { verifyToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');
const pool = require('../config/db');

/**
 * Verifies the JWT in the Authorization header and attaches the current
 * user (fresh from the DB, not just the token payload) to req.user.
 * Re-fetching from the DB means a deactivated/blocked account is caught
 * immediately rather than trusting a possibly-stale token claim.
 */
async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      throw ApiError.unauthorized('Missing or malformed Authorization header');
    }

    let payload;
    try {
      payload = verifyToken(token);
    } catch (err) {
      throw ApiError.unauthorized('Invalid or expired token');
    }

    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [payload.sub]
    );

    if (rows.length === 0) {
      throw ApiError.unauthorized('User no longer exists');
    }
    if (!rows[0].is_active) {
      throw ApiError.forbidden('This account has been deactivated');
    }

    req.user = rows[0];
    next();
  } catch (err) {
    next(err);
  }
}

module.exports = authenticate;
