const { body, param, query } = require('express-validator');

const placeOrderValidator = [
  body('deliveryName').trim().notEmpty().withMessage('Delivery name is required'),
  body('deliveryPhone').trim().notEmpty().withMessage('Delivery phone is required'),
  body('deliveryAddress').trim().notEmpty().withMessage('Delivery address is required'),
];

const updateStatusValidator = [
  param('id').isInt().withMessage('Invalid order id'),
  body('status')
    .isIn(['Processing', 'In Route', 'Delivered', 'Received', 'Canceled'])
    .withMessage('Invalid status value'),
];

const listOrdersValidator = [
  query('status')
    .optional()
    .isIn(['Placed', 'Processing', 'In Route', 'Delivered', 'Received', 'Canceled'])
    .withMessage('Invalid status filter'),
];

const idParamValidator = [param('id').isInt().withMessage('Invalid order id')];

module.exports = { placeOrderValidator, updateStatusValidator, listOrdersValidator, idParamValidator };
