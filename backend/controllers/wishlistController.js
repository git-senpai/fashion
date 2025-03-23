const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Product = require("../models/productModel");

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price image images countInStock rating numReviews",
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user.wishlist);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  try {
    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      throw new Error("Product not found");
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if product is already in wishlist
    if (user.wishlist.includes(productId)) {
      res.status(400);
      throw new Error("Product already in wishlist");
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    // Get updated wishlist with product details
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price image images countInStock rating numReviews",
    });

    res.status(201).json(updatedUser.wishlist);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if product is in wishlist
    if (!user.wishlist.includes(productId)) {
      res.status(400);
      throw new Error("Product not in wishlist");
    }

    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
    await user.save();

    // Get updated wishlist with product details
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlist",
      select: "name price image images countInStock rating numReviews",
    });

    res.json(updatedUser.wishlist);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Clear entire wishlist
// @route   DELETE /api/wishlist
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Clear wishlist
    user.wishlist = [];
    await user.save();

    res.json([]);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
