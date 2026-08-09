const express = require('express');
const restaurantController = require('../controllers/restaurantController');
const mealController = require('../controllers/mealController');
const authenticate = require('../middleware/authenticate');
const optionalAuthenticate = require('../middleware/optionalAuthenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  createRestaurantValidator,
  updateRestaurantValidator,
  idParamValidator,
} = require('../validators/restaurantValidators');

const router = express.Router();

// Public
router.get('/', restaurantController.listRestaurants);

// Owner-only: must come before /:id so "mine" isn't parsed as an id
router.get('/mine', authenticate, authorize('restaurant_owner'), restaurantController.listMyRestaurants);

router.get('/:id', idParamValidator, validate, restaurantController.getRestaurant);
router.get('/:id/meals', optionalAuthenticate, mealController.listMealsForRestaurant);

router.post(
  '/',
  authenticate,
  authorize('restaurant_owner'),
  createRestaurantValidator,
  validate,
  restaurantController.createRestaurant
);

router.put(
  '/:id',
  authenticate,
  authorize('restaurant_owner'),
  updateRestaurantValidator,
  validate,
  restaurantController.updateRestaurant
);

router.delete(
  '/:id',
  authenticate,
  authorize('restaurant_owner'),
  idParamValidator,
  validate,
  restaurantController.deleteRestaurant
);

module.exports = router;
