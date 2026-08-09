const restaurantService = require('../services/restaurantService');
const asyncHandler = require('../utils/asyncHandler');

// GET /api/restaurants - public listing (active only), with optional ?search=&foodType=
const listRestaurants = asyncHandler(async (req, res) => {
  const { search, foodType } = req.query;
  const restaurants = await restaurantService.listActiveRestaurants({ search, foodType });
  res.json({ restaurants });
});

// GET /api/restaurants/mine - restaurant owner's own restaurants (active + inactive)
const listMyRestaurants = asyncHandler(async (req, res) => {
  const restaurants = await restaurantService.listOwnedRestaurants(req.user.id);
  res.json({ restaurants });
});

// GET /api/restaurants/:id
const getRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.getRestaurantById(req.params.id);
  res.json({ restaurant });
});

// POST /api/restaurants
const createRestaurant = asyncHandler(async (req, res) => {
  const { name, description, foodType, image } = req.body;
  const restaurant = await restaurantService.createRestaurant(req.user.id, { name, description, foodType, image });
  res.status(201).json({ restaurant });
});

// PUT /api/restaurants/:id
const updateRestaurant = asyncHandler(async (req, res) => {
  const restaurant = await restaurantService.updateRestaurant(req.params.id, req.user.id, req.body);
  res.json({ restaurant });
});

// DELETE /api/restaurants/:id
const deleteRestaurant = asyncHandler(async (req, res) => {
  await restaurantService.deleteRestaurant(req.params.id, req.user.id);
  res.status(204).send();
});

module.exports = {
  listRestaurants,
  listMyRestaurants,
  getRestaurant,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
