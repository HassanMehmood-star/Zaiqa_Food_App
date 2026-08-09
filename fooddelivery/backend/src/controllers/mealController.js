const mealService = require('../services/mealService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/restaurants/:id/meals
const listMealsForRestaurant = asyncHandler(async (req, res) => {
  // Public callers only see available meals; the owner viewing their own
  // restaurant sees everything (including hidden/unavailable meals).
  const isOwnerViewing = req.user && req.user.role === 'restaurant_owner';
  const meals = await mealService.listByRestaurant(req.params.id, { onlyAvailable: !isOwnerViewing });
  res.json({ meals });
});

// GET /api/meals/:id
const getMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.getMealById(req.params.id);
  res.json({ meal });
});

// POST /api/meals
const createMeal = asyncHandler(async (req, res) => {
  const { restaurantId, name, description, price, image } = req.body;
  const meal = await mealService.createMeal(req.user.id, { restaurantId, name, description, price, image });
  res.status(201).json({ meal });
});

// PUT /api/meals/:id
const updateMeal = asyncHandler(async (req, res) => {
  const meal = await mealService.updateMeal(req.params.id, req.user.id, req.body);
  res.json({ meal });
});

// DELETE /api/meals/:id
const deleteMeal = asyncHandler(async (req, res) => {
  await mealService.deleteMeal(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = { listMealsForRestaurant, getMeal, createMeal, updateMeal, deleteMeal };
