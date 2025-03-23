const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

// All wishlist routes are protected
router
  .route("/")
  .get(protect, getWishlist) // Get user's wishlist
  .post(protect, addToWishlist) // Add item to wishlist
  .delete(protect, clearWishlist); // Clear entire wishlist

router.route("/:id").delete(protect, removeFromWishlist); // Remove specific item from wishlist

module.exports = router;
