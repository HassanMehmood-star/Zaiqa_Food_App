const express = require('express');
const orderController = require('../controllers/orderController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  placeOrderValidator,
  updateStatusValidator,
  listOrdersValidator,
  idParamValidator,
} = require('../validators/orderValidators');

const router = express.Router();

router.use(authenticate);

// Only regular users place orders.
router.post('/', authorize('regular_user'), placeOrderValidator, validate, orderController.placeOrder);

// Both roles list orders, scoped differently in the controller/service.
router.get('/', listOrdersValidator, validate, orderController.listOrders);

router.get('/:id', idParamValidator, validate, orderController.getOrder);
router.get('/:id/history', idParamValidator, validate, orderController.getHistory);

// Both roles can hit this; the service enforces which role can make which transition.
router.patch('/:id/status', updateStatusValidator, validate, orderController.updateStatus);

module.exports = router;
