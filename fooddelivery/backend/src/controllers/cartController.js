const cartService = require('../services/cartService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/cart
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart(req.user.id);
  res.json({ cart });
});

// POST /api/cart/items
const addItem = asyncHandler(async (req, res) => {
  const { mealId, quantity, replaceCart } = req.body;
  const cart = await cartService.addItem(req.user.id, { mealId, quantity, replaceCart });
  res.status(201).json({ cart });
});

// PUT /api/cart/items/:itemId
const updateItem = asyncHandler(async (req, res) => {
  const cart = await cartService.updateItemQuantity(req.user.id, req.params.itemId, req.body.quantity);
  res.json({ cart });
});

// DELETE /api/cart/items/:itemId
const removeItem = asyncHandler(async (req, res) => {
  const cart = await cartService.removeItem(req.user.id, req.params.itemId);
  res.json({ cart });
});

// DELETE /api/cart
const clearCart = asyncHandler(async (req, res) => {
  await cartService.clearCart(req.user.id);
  res.status(204).send();
});

module.exports = { getCart, addItem, updateItem, removeItem, clearCart };
