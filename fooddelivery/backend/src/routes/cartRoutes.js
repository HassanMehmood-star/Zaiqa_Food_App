const express = require('express');
const cartController = require('../controllers/cartController');
const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');
const validate = require('../middleware/validate');
const {
  addItemValidator,
  updateItemValidator,
  itemIdParamValidator,
} = require('../validators/cartValidators');

const router = express.Router();

// Cart is a regular-user concept only.
router.use(authenticate, authorize('regular_user'));

router.get('/', cartController.getCart);
router.post('/items', addItemValidator, validate, cartController.addItem);
router.put('/items/:itemId', updateItemValidator, validate, cartController.updateItem);
router.delete('/items/:itemId', itemIdParamValidator, validate, cartController.removeItem);
router.delete('/', cartController.clearCart);

module.exports = router;
