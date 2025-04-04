const express = require("express");
const router = express.Router();
const {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} = require("../controllers/addressController");
const { protect } = require("../middleware/authMiddleware");

// All routes are protected - require authentication
router.route("/")
  .get(protect, getAddresses)
  .post(protect, createAddress);

router.route("/:id")
  .put(protect, updateAddress)
  .delete(protect, deleteAddress);

router.route("/:id/default")
  .put(protect, setDefaultAddress);

module.exports = router; 