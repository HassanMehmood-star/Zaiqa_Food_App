const ApiError = require('../utils/ApiError');

/**
 * Restricts a route to one or more roles.
 * Usage: router.post('/restaurants', authenticate, authorize('restaurant_owner'), handler)
 */
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(ApiError.unauthorized());
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(ApiError.forbidden('You do not have permission to perform this action'));
    }
    next();
  };
}

module.exports = authorize;
