const { body, param } = require('express-validator');

const createMealValidator = [
  body('restaurantId').isInt().withMessage('restaurantId is required'),
  body('name').trim().notEmpty().withMessage('Meal name is required').isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim(),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
  body('image').optional({ nullable: true }).trim().isURL().withMessage('Image must be a valid URL'),
];

const updateMealValidator = [
  param('id').isInt().withMessage('Invalid meal id'),
  body('name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim(),
  body('price').optional().isFloat({ min: 0 }),
  body('image').optional({ nullable: true }).trim().isURL(),
  body('isAvailable').optional().isBoolean(),
];

module.exports = { createMealValidator, updateMealValidator };
