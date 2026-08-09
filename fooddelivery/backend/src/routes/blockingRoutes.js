const express = require('express');
const blockingController = require('../controllers/blockingController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

// Nested under /api/restaurants/:restaurantId/blocked-users
const blockedUsersRouter = express.Router({ mergeParams: true });
blockedUsersRouter.use(authenticate, authorize('restaurant_owner'));
blockedUsersRouter.get('/', blockingController.listBlockedUsers);
blockedUsersRouter.post('/:userId', blockingController.blockUser);
blockedUsersRouter.delete('/:userId', blockingController.unblockUser);

// Mounted at /api/users - search only, restaurant owners looking up users to block
const usersRouter = express.Router();
usersRouter.get('/', authenticate, authorize('restaurant_owner'), blockingController.searchUsers);

module.exports = { blockedUsersRouter, usersRouter };
