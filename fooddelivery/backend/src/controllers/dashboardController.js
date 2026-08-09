const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');

const getDashboard = asyncHandler(async (req, res) => {
  const data =
    req.user.role === 'restaurant_owner'
      ? await dashboardService.getOwnerDashboard(req.user.id)
      : await dashboardService.getUserDashboard(req.user.id);
  res.json({ dashboard: data });
});

module.exports = { getDashboard };
