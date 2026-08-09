const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function listActiveRestaurants({ search, foodType }) {
  const conditions = ['is_active = TRUE'];
  const params = [];

  if (search) {
    params.push(`%${search}%`);
    conditions.push(`name ILIKE $${params.length}`);
  }
  if (foodType) {
    params.push(foodType);
    conditions.push(`food_type = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT id, owner_id, name, description, food_type, image, created_at
     FROM restaurants WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    params
  );
  return rows;
}

async function listOwnedRestaurants(ownerId) {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, description, food_type, image, is_active, created_at
     FROM restaurants WHERE owner_id = $1 ORDER BY created_at DESC`,
    [ownerId]
  );
  return rows;
}

async function getRestaurantById(id) {
  const { rows } = await pool.query(
    `SELECT id, owner_id, name, description, food_type, image, is_active, created_at, updated_at
     FROM restaurants WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) throw ApiError.notFound('Restaurant not found');
  return rows[0];
}

async function assertOwnership(restaurantId, userId) {
  const restaurant = await getRestaurantById(restaurantId);
  if (restaurant.owner_id !== userId) {
    throw ApiError.forbidden('You do not own this restaurant');
  }
  return restaurant;
}

async function createRestaurant(ownerId, { name, description, foodType, image }) {
  const { rows } = await pool.query(
    `INSERT INTO restaurants (owner_id, name, description, food_type, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, owner_id, name, description, food_type, image, is_active, created_at`,
    [ownerId, name, description || null, foodType || null, image || null]
  );
  return rows[0];
}

async function updateRestaurant(id, ownerId, updates) {
  await assertOwnership(id, ownerId);

  const fields = [];
  const params = [];
  const map = { name: 'name', description: 'description', foodType: 'food_type', image: 'image', isActive: 'is_active' };

  for (const [key, column] of Object.entries(map)) {
    if (updates[key] !== undefined) {
      params.push(updates[key]);
      fields.push(`${column} = $${params.length}`);
    }
  }

  if (fields.length === 0) {
    return getRestaurantById(id);
  }

  fields.push('updated_at = NOW()');
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE restaurants SET ${fields.join(', ')} WHERE id = $${params.length}
     RETURNING id, owner_id, name, description, food_type, image, is_active, updated_at`,
    params
  );
  return rows[0];
}

async function deleteRestaurant(id, ownerId) {
  await assertOwnership(id, ownerId);
  await pool.query('DELETE FROM restaurants WHERE id = $1', [id]);
}

module.exports = {
  listActiveRestaurants,
  listOwnedRestaurants,
  getRestaurantById,
  assertOwnership,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
