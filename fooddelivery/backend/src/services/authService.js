const bcrypt = require('bcrypt');
const pool = require('../config/db');
const { signToken } = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

const SALT_ROUNDS = 12;

async function register({ fullName, email, password, role }) {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) {
    throw ApiError.conflict('An account with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const { rows } = await pool.query(
    `INSERT INTO users (full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, full_name, email, role, created_at`,
    [fullName, email, passwordHash, role]
  );

  const user = rows[0];
  const token = signToken({ sub: user.id, role: user.role });
  return { user, token };
}

async function login({ email, password }) {
  const { rows } = await pool.query(
    'SELECT id, full_name, email, password_hash, role, is_active FROM users WHERE email = $1',
    [email]
  );

  // Same generic error whether the email doesn't exist or the password is
  // wrong, so we don't leak which emails are registered.
  if (rows.length === 0) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const user = rows[0];

  if (!user.is_active) {
    throw ApiError.forbidden('This account has been deactivated');
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatches) {
    throw ApiError.unauthorized('Invalid email or password');
  }

  const token = signToken({ sub: user.id, role: user.role });

  delete user.password_hash;
  return { user, token };
}

module.exports = { register, login };
