const express = require('express');
const mealController = require('../controllers/mealController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const { createMealValidator, updateMealValidator } = require('../validators/mealValidators');

const router = express.Router();

router.get('/:id', mealController.getMeal);

router.post(
  '/',
  authenticate,
  authorize('restaurant_owner'),
  createMealValidator,
  validate,
  mealController.createMeal
);

router.put(
  '/:id',
  authenticate,
  authorize('restaurant_owner'),
  updateMealValidator,
  validate,
  mealController.updateMeal
);

router.delete('/:id', authenticate, authorize('restaurant_owner'), mealController.deleteMeal);

module.exports = router;
