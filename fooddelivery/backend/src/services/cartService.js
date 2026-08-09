const pool = require('../config/db');
const ApiError = require('../utils/ApiError');

async function getOrCreateCart(userId) {
  const existing = await pool.query('SELECT * FROM carts WHERE user_id = $1', [userId]);
  if (existing.rows.length > 0) return existing.rows[0];

  const { rows } = await pool.query(
    'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
    [userId]
  );
  return rows[0];
}

// Returns the cart along with joined meal/restaurant info and computed totals.
async function getCart(userId) {
  const cart = await getOrCreateCart(userId);

  const { rows: items } = await pool.query(
    `SELECT ci.id, ci.meal_id, ci.quantity, m.name AS meal_name, m.price AS unit_price,
            m.image AS meal_image, m.is_available, m.restaurant_id
     FROM cart_items ci
     JOIN meals m ON m.id = ci.meal_id
     WHERE ci.cart_id = $1
     ORDER BY ci.created_at ASC`,
    [cart.id]
  );

  let restaurant = null;
  if (cart.restaurant_id) {
    const { rows } = await pool.query(
      'SELECT id, name, image, is_active FROM restaurants WHERE id = $1',
      [cart.restaurant_id]
    );
    restaurant = rows[0] || null;
  }

  const itemsWithSubtotal = items.map((item) => ({
    ...item,
    subtotal: Number(item.unit_price) * item.quantity,
  }));

  const total = itemsWithSubtotal.reduce((sum, item) => sum + item.subtotal, 0);

  return { cartId: cart.id, restaurant, items: itemsWithSubtotal, total };
}

/**
 * Adds a meal to the cart.
 * If the cart already has items from a different restaurant, this throws a
 * 409 conflict UNLESS replaceCart=true, in which case the cart is cleared
 * first and the new item becomes the start of a fresh order. This mirrors
 * the "clear cart and start a new order?" confirmation the frontend shows.
 */
async function addItem(userId, { mealId, quantity = 1, replaceCart = false }) {
  const { rows: mealRows } = await pool.query(
    'SELECT id, restaurant_id, is_available FROM meals WHERE id = $1',
    [mealId]
  );
  if (mealRows.length === 0) throw ApiError.notFound('Meal not found');
  const meal = mealRows[0];
  if (!meal.is_available) throw ApiError.badRequest('This meal is currently unavailable');

  const cart = await getOrCreateCart(userId);

  if (cart.restaurant_id && cart.restaurant_id !== meal.restaurant_id) {
    if (!replaceCart) {
      throw new ApiError(409, 'Your cart contains items from another restaurant', {
        code: 'RESTAURANT_MISMATCH',
      });
    }
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
    await pool.query('UPDATE carts SET restaurant_id = $1, updated_at = NOW() WHERE id = $2', [
      meal.restaurant_id,
      cart.id,
    ]);
  } else if (!cart.restaurant_id) {
    await pool.query('UPDATE carts SET restaurant_id = $1, updated_at = NOW() WHERE id = $2', [
      meal.restaurant_id,
      cart.id,
    ]);
  }

  await pool.query(
    `INSERT INTO cart_items (cart_id, meal_id, quantity)
     VALUES ($1, $2, $3)
     ON CONFLICT (cart_id, meal_id)
     DO UPDATE SET quantity = cart_items.quantity + EXCLUDED.quantity, updated_at = NOW()`,
    [cart.id, mealId, quantity]
  );

  return getCart(userId);
}

async function updateItemQuantity(userId, itemId, quantity) {
  const cart = await getOrCreateCart(userId);
  const { rows } = await pool.query(
    'UPDATE cart_items SET quantity = $1, updated_at = NOW() WHERE id = $2 AND cart_id = $3 RETURNING *',
    [quantity, itemId, cart.id]
  );
  if (rows.length === 0) throw ApiError.notFound('Cart item not found');
  return getCart(userId);
}

async function removeItem(userId, itemId) {
  const cart = await getOrCreateCart(userId);
  const { rows } = await pool.query(
    'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
    [itemId, cart.id]
  );
  if (rows.length === 0) throw ApiError.notFound('Cart item not found');

  const { rows: remaining } = await pool.query(
    'SELECT COUNT(*)::int AS count FROM cart_items WHERE cart_id = $1',
    [cart.id]
  );
  if (remaining[0].count === 0) {
    await pool.query('UPDATE carts SET restaurant_id = NULL, updated_at = NOW() WHERE id = $1', [cart.id]);
  }

  return getCart(userId);
}

async function clearCart(userId) {
  const cart = await getOrCreateCart(userId);
  await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.id]);
  await pool.query('UPDATE carts SET restaurant_id = NULL, updated_at = NOW() WHERE id = $1', [cart.id]);
}

module.exports = { getOrCreateCart, getCart, addItem, updateItemQuantity, removeItem, clearCart };
