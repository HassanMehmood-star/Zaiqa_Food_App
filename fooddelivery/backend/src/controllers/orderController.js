const orderService = require('../services/orderService');
const asyncHandler = require('../utils/asyncHandler');

// POST /api/orders (regular_user only)
const placeOrder = asyncHandler(async (req, res) => {
  const { deliveryName, deliveryPhone, deliveryAddress } = req.body;
  const order = await orderService.placeOrder(req.user.id, { deliveryName, deliveryPhone, deliveryAddress });
  res.status(201).json({ order });
});

// GET /api/orders (role-aware: user sees their orders, owner sees their restaurants' orders)
const listOrders = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const orders =
    req.user.role === 'restaurant_owner'
      ? await orderService.listOrdersForOwner(req.user.id, { status })
      : await orderService.listOrdersForUser(req.user.id, { status });
  res.json({ orders });
});

// GET /api/orders/:id
const getOrder = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
  res.json({ order });
});

// PATCH /api/orders/:id/status
const updateStatus = asyncHandler(async (req, res) => {
  const order = await orderService.updateStatus(req.params.id, req.user, req.body.status);
  res.json({ order });
});

// GET /api/orders/:id/history
const getHistory = asyncHandler(async (req, res) => {
  const order = await orderService.getOrderById(req.params.id, req.user.id, req.user.role);
  res.json({ history: order.history });
});

module.exports = { placeOrder, listOrders, getOrder, updateStatus, getHistory };
