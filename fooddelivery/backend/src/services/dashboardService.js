const pool = require('../config/db');

async function getUserDashboard(userId) {
  const { rows: counts } = await pool.query(
    `SELECT
       COUNT(*)::int AS total_orders,
       COUNT(*) FILTER (WHERE status IN ('Placed','Processing','In Route'))::int AS active_orders,
       COUNT(*) FILTER (WHERE status IN ('Delivered','Received'))::int AS completed_orders,
       COUNT(*) FILTER (WHERE status = 'Canceled')::int AS canceled_orders
     FROM orders WHERE user_id = $1`,
    [userId]
  );

  const { rows: recentOrders } = await pool.query(
    `SELECT o.id, r.name AS restaurant_name, o.total_amount, o.status, o.order_date
     FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
     WHERE o.user_id = $1 ORDER BY o.order_date DESC LIMIT 5`,
    [userId]
  );

  const { rows: popularRestaurants } = await pool.query(
    `SELECT r.id, r.name, r.image, r.food_type, COUNT(o.id)::int AS order_count
     FROM orders o JOIN restaurants r ON r.id = o.restaurant_id
     GROUP BY r.id ORDER BY order_count DESC LIMIT 6`
  );

  return { ...counts[0], recentOrders, popularRestaurants };
}

async function getOwnerDashboard(ownerId) {
  const { rows: restaurantCount } = await pool.query(
    'SELECT COUNT(*)::int AS total_restaurants FROM restaurants WHERE owner_id = $1',
    [ownerId]
  );

  const { rows: mealCount } = await pool.query(
    `SELECT COUNT(*)::int AS total_meals FROM meals m
     JOIN restaurants r ON r.id = m.restaurant_id WHERE r.owner_id = $1`,
    [ownerId]
  );

  const { rows: orderStats } = await pool.query(
    `SELECT
       COUNT(*)::int AS total_orders,
       COUNT(*) FILTER (WHERE o.status = 'Placed')::int AS pending_orders,
       COUNT(*) FILTER (WHERE o.status = 'Processing')::int AS processing_orders,
       COUNT(*) FILTER (WHERE o.status IN ('Delivered','Received'))::int AS completed_orders,
       COALESCE(SUM(o.total_amount) FILTER (WHERE o.status <> 'Canceled'), 0) AS revenue
     FROM orders o JOIN restaurants r ON r.id = o.restaurant_id WHERE r.owner_id = $1`,
    [ownerId]
  );

  const { rows: recentOrders } = await pool.query(
    `SELECT o.id, r.name AS restaurant_name, u.full_name AS customer_name, o.total_amount, o.status, o.order_date
     FROM orders o
     JOIN restaurants r ON r.id = o.restaurant_id
     JOIN users u ON u.id = o.user_id
     WHERE r.owner_id = $1 ORDER BY o.order_date DESC LIMIT 5`,
    [ownerId]
  );

  return {
    ...restaurantCount[0],
    ...mealCount[0],
    ...orderStats[0],
    recentOrders,
  };
}

module.exports = { getUserDashboard, getOwnerDashboard };
