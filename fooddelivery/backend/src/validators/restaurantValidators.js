const { body, param } = require('express-validator');

const createRestaurantValidator = [
  body('name').trim().notEmpty().withMessage('Restaurant name is required').isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim(),
  body('foodType').optional({ nullable: true }).trim().isLength({ max: 80 }),
  body('image').optional({ nullable: true }).trim().isURL().withMessage('Image must be a valid URL'),
];

const updateRestaurantValidator = [
  param('id').isInt().withMessage('Invalid restaurant id'),
  body('name').optional().trim().notEmpty().isLength({ max: 150 }),
  body('description').optional({ nullable: true }).trim(),
  body('foodType').optional({ nullable: true }).trim().isLength({ max: 80 }),
  body('image').optional({ nullable: true }).trim().isURL(),
  body('isActive').optional().isBoolean(),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid id')];

module.exports = { createRestaurantValidator, updateRestaurantValidator, idParamValidator };
