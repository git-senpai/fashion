const express = require("express");
const router = express.Router();
const {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
} = require("../controllers/cartController");
const { protect } = require("../middleware/authMiddleware");

// All cart routes are protected - require authentication
router.use(protect);

// @route   GET /api/cart
// @desc    Get user cart
// @access  Private
router.route("/").get(getCart);

// @route   POST /api/cart
// @desc    Add item to cart
// @access  Private
router.route("/").post(addToCart);

// @route   PUT /api/cart/:id
// @desc    Update cart item quantity
// @access  Private
router.route("/:id").put(updateCartItem);

// @route   DELETE /api/cart/:id
// @desc    Remove item from cart
// @access  Private
router.route("/:id").delete(removeFromCart);

// @route   DELETE /api/cart
// @desc    Clear entire cart
// @access  Private
router.route("/").delete(clearCart);

// @route   POST /api/cart/sync
// @desc    Sync local cart with database
// @access  Private
router.route("/sync").post(syncCart);

module.exports = router;
