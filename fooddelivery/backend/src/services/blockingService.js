const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const restaurantService = require('./restaurantService');

async function searchUsers(query) {
  const { rows } = await pool.query(
    `SELECT id, full_name, email FROM users
     WHERE role = 'regular_user' AND (full_name ILIKE $1 OR email ILIKE $1)
     ORDER BY full_name ASC LIMIT 20`,
    [`%${query}%`]
  );
  return rows;
}

async function blockUser(restaurantId, ownerId, userId) {
  await restaurantService.assertOwnership(restaurantId, ownerId);

  const { rows: userRows } = await pool.query(
    "SELECT id FROM users WHERE id = $1 AND role = 'regular_user'",
    [userId]
  );
  if (userRows.length === 0) throw ApiError.notFound('User not found');

  await pool.query(
    `INSERT INTO restaurant_blocked_users (restaurant_id, user_id)
     VALUES ($1, $2) ON CONFLICT (restaurant_id, user_id) DO NOTHING`,
    [restaurantId, userId]
  );
}

async function unblockUser(restaurantId, ownerId, userId) {
  await restaurantService.assertOwnership(restaurantId, ownerId);
  await pool.query(
    'DELETE FROM restaurant_blocked_users WHERE restaurant_id = $1 AND user_id = $2',
    [restaurantId, userId]
  );
}

async function listBlockedUsers(restaurantId, ownerId) {
  await restaurantService.assertOwnership(restaurantId, ownerId);
  const { rows } = await pool.query(
    `SELECT u.id, u.full_name, u.email, b.blocked_at
     FROM restaurant_blocked_users b
     JOIN users u ON u.id = b.user_id
     WHERE b.restaurant_id = $1
     ORDER BY b.blocked_at DESC`,
    [restaurantId]
  );
  return rows;
}

module.exports = { searchUsers, blockUser, unblockUser, listBlockedUsers };
