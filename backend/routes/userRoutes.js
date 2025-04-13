const express = require("express");
const router = express.Router();
const {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  getUsers,
  deleteUser,
  getUserById,
  updateUser,
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  getUserStats,
} = require("../controllers/userController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/login", authUser);
router.post("/", registerUser);

// Protected routes
router
  .route("/profile")
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Wishlist routes
router
  .route("/wishlist")
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route("/wishlist/:id").delete(protect, removeFromWishlist);

// Admin routes
router.route("/").get(protect, admin, getUsers);
router.route("/stats").get(protect, admin, getUserStats);

router
  .route("/:id")
  .delete(protect, admin, deleteUser)
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser);

module.exports = router;
