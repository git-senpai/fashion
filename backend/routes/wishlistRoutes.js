const express = require("express");
const router = express.Router();
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  getWishlistCollections,
  createWishlistCollection,
  deleteWishlistCollection,
  addProductToCollection,
  removeProductFromCollection,
  moveProductBetweenCollections
} = require("../controllers/wishlistController");
const { protect } = require("../middleware/authMiddleware");

// All wishlist routes are protected
router
  .route("/")
  .get(protect, getWishlist) // Get user's wishlist
  .post(protect, addToWishlist) // Add item to wishlist
  .delete(protect, clearWishlist); // Clear entire wishlist

router.route("/:id").delete(protect, removeFromWishlist); // Remove specific item from wishlist

// Collection routes
router
  .route("/collections")
  .get(protect, getWishlistCollections) // Get user's wishlist collections
  .post(protect, createWishlistCollection); // Create a new collection

router
  .route("/collections/:id")
  .delete(protect, deleteWishlistCollection); // Delete a collection

router
  .route("/collections/:id/products")
  .post(protect, addProductToCollection); // Add product to a collection

router
  .route("/collections/:id/products/:productId")
  .delete(protect, removeProductFromCollection); // Remove product from a collection

router
  .route("/collections/:id/products/:productId/move")
  .put(protect, moveProductBetweenCollections); // Move product between collections

module.exports = router;
