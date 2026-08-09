const pool = require('../config/db');
const ApiError = require('../utils/ApiError');
const cartService = require('./cartService');
const { getAllowedRole } = require('../utils/orderStatusTransitions');

async function isUserBlocked(restaurantId, userId) {
  const { rows } = await pool.query(
    'SELECT 1 FROM restaurant_blocked_users WHERE restaurant_id = $1 AND user_id = $2',
    [restaurantId, userId]
  );
  return rows.length > 0;
}

/**
 * Places an order from the user's current cart.
 * - Re-validates everything server-side (restaurant active, user not
 *   blocked, meal availability) rather than trusting the cart snapshot.
 * - Recalculates the total from live meal prices - the frontend total is
 *   never trusted.
 * - Runs inside a transaction so the order, its items, the first history
 *   row, and the cart clear all succeed or fail together.
 */
async function placeOrder(userId, { deliveryName, deliveryPhone, deliveryAddress }) {
  const cart = await cartService.getCart(userId);

  if (!cart.restaurant || cart.items.length === 0) {
    throw ApiError.badRequest('Your cart is empty');
  }
  if (!cart.restaurant.is_active) {
    throw ApiError.badRequest('This restaurant is not currently active');
  }
  if (await isUserBlocked(cart.restaurant.id, userId)) {
    throw ApiError.forbidden('You are currently blocked from placing orders at this restaurant');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Re-fetch live meal data for every cart item inside the transaction.
    const mealIds = cart.items.map((i) => i.meal_id);
    const { rows: liveMeals } = await client.query(
      'SELECT id, name, price, is_available, restaurant_id FROM meals WHERE id = ANY($1::int[])',
      [mealIds]
    );
    const mealById = new Map(liveMeals.map((m) => [m.id, m]));

    let total = 0;
    const lineItems = [];
    for (const cartItem of cart.items) {
      const meal = mealById.get(cartItem.meal_id);
      if (!meal || !meal.is_available) {
        throw ApiError.badRequest(`"${cartItem.meal_name}" is no longer available`);
      }
      if (meal.restaurant_id !== cart.restaurant.id) {
        throw ApiError.badRequest('Cart contains items from more than one restaurant');
      }
      const subtotal = Number(meal.price) * cartItem.quantity;
      total += subtotal;
      lineItems.push({
        mealId: meal.id,
        name: meal.name,
        price: meal.price,
        quantity: cartItem.quantity,
        subtotal,
      });
    }

    const { rows: orderRows } = await client.query(
      `INSERT INTO orders (user_id, restaurant_id, total_amount, status, delivery_name, delivery_phone, delivery_address)
       VALUES ($1, $2, $3, 'Placed', $4, $5, $6)
       RETURNING *`,
      [userId, cart.restaurant.id, total, deliveryName, deliveryPhone, deliveryAddress]
    );
    const order = orderRows[0];

    for (const item of lineItems) {
      await client.query(
        `INSERT INTO order_items (order_id, meal_id, meal_name_snapshot, price_snapshot, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [order.id, item.mealId, item.name, item.price, item.quantity, item.subtotal]
      );
    }

    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, changed_by_role)
       VALUES ($1, 'Placed', $2, 'regular_user')`,
      [order.id, userId]
    );

    await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cart.cartId]);
    await client.query('UPDATE carts SET restaurant_id = NULL, updated_at = NOW() WHERE id = $1', [
      cart.cartId,
    ]);

    await client.query('COMMIT');
    return getOrderById(order.id, userId, 'regular_user');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function getOrderById(orderId, requesterId, requesterRole) {
  const { rows } = await pool.query(
    `SELECT o.*, r.name AS restaurant_name, r.owner_id AS restaurant_owner_id, u.full_name AS customer_name
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     JOIN users u ON u.id = o.user_id
     WHERE o.id = $1`,
    [orderId]
  );
  if (rows.length === 0) throw ApiError.notFound('Order not found');
  const order = rows[0];

  const isCustomer = requesterRole === 'regular_user' && order.user_id === requesterId;
  const isOwner = requesterRole === 'restaurant_owner' && order.restaurant_owner_id === requesterId;
  if (!isCustomer && !isOwner) {
    throw ApiError.forbidden('You do not have access to this order');
  }

  const { rows: items } = await pool.query(
    'SELECT id, meal_id, meal_name_snapshot, price_snapshot, quantity, subtotal FROM order_items WHERE order_id = $1',
    [orderId]
  );

  const { rows: history } = await pool.query(
    `SELECT h.status, h.changed_by, h.changed_by_role, h.changed_at, u.full_name AS changed_by_name
     FROM order_status_history h
     LEFT JOIN users u ON u.id = h.changed_by
     WHERE h.order_id = $1
     ORDER BY h.changed_at ASC`,
    [orderId]
  );

  return { ...order, items, history };
}

async function listOrdersForUser(userId, { status }) {
  const conditions = ['user_id = $1'];
  const params = [userId];
  if (status) {
    params.push(status);
    conditions.push(`status = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT o.id, o.restaurant_id, r.name AS restaurant_name, o.total_amount, o.status, o.order_date
     FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.order_date DESC`,
    params
  );
  return rows;
}

async function listOrdersForOwner(ownerId, { status }) {
  const conditions = ['r.owner_id = $1'];
  const params = [ownerId];
  if (status) {
    params.push(status);
    conditions.push(`o.status = $${params.length}`);
  }

  const { rows } = await pool.query(
    `SELECT o.id, o.restaurant_id, r.name AS restaurant_name, u.full_name AS customer_name,
            o.total_amount, o.status, o.order_date
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     JOIN users u ON u.id = o.user_id
     WHERE ${conditions.join(' AND ')}
     ORDER BY o.order_date DESC`,
    params
  );
  return rows;
}

/**
 * Validates and applies a status transition per the centralized state
 * machine. This is the ONLY place order status is ever written, so every
 * entry point (owner action buttons, customer "mark received", customer
 * "cancel") funnels through the same rules.
 */
async function updateStatus(orderId, actingUser, newStatus) {
  const { rows } = await pool.query(
    `SELECT o.*, r.owner_id AS restaurant_owner_id
     FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.id = $1`,
    [orderId]
  );
  if (rows.length === 0) throw ApiError.notFound('Order not found');
  const order = rows[0];

  const requiredRole = getAllowedRole(order.status, newStatus);
  if (!requiredRole) {
    throw ApiError.badRequest(`Cannot change status from "${order.status}" to "${newStatus}"`);
  }
  if (actingUser.role !== requiredRole) {
    throw ApiError.forbidden(`Only a ${requiredRole.replace('_', ' ')} can make this status change`);
  }

  if (actingUser.role === 'regular_user' && order.user_id !== actingUser.id) {
    throw ApiError.forbidden('This is not your order');
  }
  if (actingUser.role === 'restaurant_owner' && order.restaurant_owner_id !== actingUser.id) {
    throw ApiError.forbidden('This order does not belong to your restaurant');
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query('UPDATE orders SET status = $1, updated_at = NOW() WHERE id = $2', [
      newStatus,
      orderId,
    ]);
    await client.query(
      `INSERT INTO order_status_history (order_id, status, changed_by, changed_by_role)
       VALUES ($1, $2, $3, $4)`,
      [orderId, newStatus, actingUser.id, actingUser.role]
    );
    await client.query('COMMIT');
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }

  return getOrderById(orderId, actingUser.id, actingUser.role);
}

module.exports = { placeOrder, getOrderById, listOrdersForUser, listOrdersForOwner, updateStatus };
