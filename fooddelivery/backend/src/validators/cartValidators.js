const { body, param } = require('express-validator');

const addItemValidator = [
  body('mealId').isInt().withMessage('mealId is required'),
  body('quantity').optional().isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
  body('replaceCart')
    .optional()
    .isBoolean()
    .withMessage('replaceCart must be a boolean'),
];

const updateItemValidator = [
  param('itemId').isInt().withMessage('Invalid cart item id'),
  body('quantity').isInt({ min: 1 }).withMessage('quantity must be a positive integer'),
];

const itemIdParamValidator = [param('itemId').isInt().withMessage('Invalid cart item id')];

module.exports = { addItemValidator, updateItemValidator, itemIdParamValidator };
