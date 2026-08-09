const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const restaurantService = require('./restaurantService');

async function listByRestaurant(restaurantId, { onlyAvailable = false } = {}) {
  const conditions = ['restaurant_id = $1'];
  if (onlyAvailable) conditions.push('is_available = TRUE');

  const { rows } = await pool.query(
    `SELECT id, restaurant_id, name, description, price, image, is_available, created_at
     FROM meals WHERE ${conditions.join(' AND ')} ORDER BY created_at DESC`,
    [restaurantId]
  );
  return rows;
}

async function getMealById(id) {
  const { rows } = await pool.query(
    `SELECT id, restaurant_id, name, description, price, image, is_available, created_at, updated_at
     FROM meals WHERE id = $1`,
    [id]
  );
  if (rows.length === 0) throw ApiError.notFound('Meal not found');
  return rows[0];
}

// A meal can only be modified by the owner of its parent restaurant.
async function assertMealOwnership(mealId, userId) {
  const meal = await getMealById(mealId);
  await restaurantService.assertOwnership(meal.restaurant_id, userId);
  return meal;
}

async function createMeal(ownerId, { restaurantId, name, description, price, image }) {
  // Throws 403/404 if the caller doesn't own the target restaurant.
  await restaurantService.assertOwnership(restaurantId, ownerId);

  const { rows } = await pool.query(
    `INSERT INTO meals (restaurant_id, name, description, price, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, restaurant_id, name, description, price, image, is_available, created_at`,
    [restaurantId, name, description || null, price, image || null]
  );
  return rows[0];
}

async function updateMeal(id, ownerId, updates) {
  await assertMealOwnership(id, ownerId);

  const fields = [];
  const params = [];
  const map = {
    name: 'name',
    description: 'description',
    price: 'price',
    image: 'image',
    isAvailable: 'is_available',
  };

  for (const [key, column] of Object.entries(map)) {
    if (updates[key] !== undefined) {
      params.push(updates[key]);
      fields.push(`${column} = $${params.length}`);
    }
  }

  if (fields.length === 0) return getMealById(id);

  fields.push('updated_at = NOW()');
  params.push(id);

  const { rows } = await pool.query(
    `UPDATE meals SET ${fields.join(', ')} WHERE id = $${params.length}
     RETURNING id, restaurant_id, name, description, price, image, is_available, updated_at`,
    params
  );
  return rows[0];
}

async function deleteMeal(id, ownerId) {
  await assertMealOwnership(id, ownerId);
  await pool.query('DELETE FROM meals WHERE id = $1', [id]);
}

module.exports = {
  listByRestaurant,
  getMealById,
  assertMealOwnership,
  createMeal,
  updateMeal,
  deleteMeal,
};
