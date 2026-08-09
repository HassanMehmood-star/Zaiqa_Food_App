const blockingService = require('../services/blockingService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/users?search=
const searchUsers = asyncHandler(async (req, res) => {
  const users = await blockingService.searchUsers(req.query.search || '');
  res.json({ users });
});

// POST /api/restaurants/:restaurantId/blocked-users/:userId
const blockUser = asyncHandler(async (req, res) => {
  await blockingService.blockUser(req.params.restaurantId, req.user.id, req.params.userId);
  res.status(204).send();
});

// DELETE /api/restaurants/:restaurantId/blocked-users/:userId
const unblockUser = asyncHandler(async (req, res) => {
  await blockingService.unblockUser(req.params.restaurantId, req.user.id, req.params.userId);
  res.status(204).send();
});

// GET /api/restaurants/:restaurantId/blocked-users
const listBlockedUsers = asyncHandler(async (req, res) => {
  const users = await blockingService.listBlockedUsers(req.params.restaurantId, req.user.id);
  res.json({ users });
});

module.exports = { searchUsers, blockUser, unblockUser, listBlockedUsers };
