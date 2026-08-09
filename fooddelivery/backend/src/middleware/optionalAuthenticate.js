const { verifyToken } = require('../utils/jwt');
const pool = require('../config/db');

/**
 * Like authenticate, but never rejects the request if no/invalid token is
 * present - it just leaves req.user undefined. Useful for routes that are
 * public but behave slightly differently for logged-in users (e.g. an
 * owner viewing their own restaurant's hidden meals).
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
      return next();
    }

    const payload = verifyToken(token);
    const { rows } = await pool.query(
      'SELECT id, full_name, email, role, is_active FROM users WHERE id = $1',
      [payload.sub]
    );

    if (rows.length > 0 && rows[0].is_active) {
      req.user = rows[0];
    }
    next();
  } catch (err) {
    // Invalid token on an optional route just means "treat as anonymous"
    next();
  }
}

module.exports = optionalAuthenticate;
