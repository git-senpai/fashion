const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const generateToken = require("../utils/generateToken");

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    // Ensure isAdmin is a boolean value
    const isAdmin = user.isAdmin === true;

    console.log(
      `User login successful: ${user.name} (${user.email}), isAdmin: ${isAdmin}`
    );

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: isAdmin,
      token: generateToken(user._id),
    });
  } else {
    console.log(`Login failed for email: ${email}`);
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error("User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error("Invalid user data");
  }
});

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
      token: generateToken(updatedUser._id),
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});
  res.json(users);
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await User.deleteOne({ _id: req.params.id });
    res.json({ message: "User removed" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user by ID
// @route   GET /api/users/:id
// @access  Private/Admin
const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.json(user);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.name = req.body.name || user.name;
    user.email = req.body.email || user.email;
    user.isAdmin = req.body.isAdmin;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      isAdmin: updatedUser.isAdmin,
    });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user wishlist
// @route   GET /api/users/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate("wishlist");

  if (user) {
    res.json(user.wishlist);
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Add product to wishlist
// @route   POST /api/users/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  const user = await User.findById(req.user._id);

  if (user) {
    // Check if product is already in wishlist
    const alreadyInWishlist = user.wishlist.find(
      (id) => id.toString() === productId
    );

    if (alreadyInWishlist) {
      res.status(400);
      throw new Error("Product already in wishlist");
    }

    // Add to wishlist
    user.wishlist.push(productId);
    await user.save();

    res.status(201).json({ message: "Product added to wishlist" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Remove product from wishlist
// @route   DELETE /api/users/wishlist/:id
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const productId = req.params.id;

  const user = await User.findById(req.user._id);

  if (user) {
    // Remove from wishlist
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);

    await user.save();

    res.json({ message: "Product removed from wishlist" });
  } else {
    res.status(404);
    throw new Error("User not found");
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private/Admin
const getUserStats = asyncHandler(async (req, res) => {
  try {
    console.log("Getting user statistics, requested by admin:", req.user.name);

    // Get all users with populated cart and wishlist
    const users = await User.find({})
      .select("-password")
      .populate("wishlist", "name price image")
      .populate({
        path: "cart.product",
        select: "name price image",
      });

    console.log(`Found ${users.length} users for stats collection`);

    // Get all orders
    const orders = await Order.find({});
    console.log(`Found ${orders.length} orders for stats collection`);

    // Process user statistics
    const userStats = await Promise.all(
      users.map(async (user) => {
        try {
          // Count wishlist items
          const wishlistCount = user.wishlist ? user.wishlist.length : 0;

          // Count cart items
          const cartCount = user.cart ? user.cart.length : 0;

          // Calculate cart value
          const cartValue = user.cart.reduce((sum, item) => {
            const price = item.product ? item.product.price || 0 : 0;
            return sum + price * item.quantity;
          }, 0);

          // Filter orders for this user
          const userOrders = orders.filter(
            (order) =>
              order.user && order.user.toString() === user._id.toString()
          );

          // Count total orders
          const orderCount = userOrders.length;

          // Calculate total spent
          const totalSpent = userOrders.reduce(
            (sum, order) => sum + (order.totalPrice || 0),
            0
          );

          // Count completed orders
          const completedOrders = userOrders.filter(
            (order) => order.isDelivered
          ).length;

          // Calculate average order value
          const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;

          // Calculate days since registration
          const daysSinceRegistration = Math.floor(
            (new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24)
          );

          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin === true,
            createdAt: user.createdAt,
            wishlistCount,
            cartCount,
            cartValue,
            orderCount,
            totalSpent,
            completedOrders,
            avgOrderValue,
            daysSinceRegistration,
          };
        } catch (err) {
          console.error(`Error processing stats for user ${user._id}:`, err);
          // Return basic user data with empty stats on error
          return {
            _id: user._id,
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin === true,
            createdAt: user.createdAt,
            wishlistCount: 0,
            cartCount: 0,
            cartValue: 0,
            orderCount: 0,
            totalSpent: 0,
            completedOrders: 0,
            avgOrderValue: 0,
            daysSinceRegistration: 0,
          };
        }
      })
    );

    console.log(`Successfully processed stats for ${userStats.length} users`);
    res.json(userStats);
  } catch (error) {
    console.error("Error in getUserStats:", error);
    res.status(500);
    throw new Error(`Failed to get user statistics: ${error.message}`);
  }
});

module.exports = {
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
};
