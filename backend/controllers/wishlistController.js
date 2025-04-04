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
      select: "name price image images countInStock rating numReviews discountPercentage",
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

// @desc    Get user's wishlist collections
// @route   GET /api/wishlist/collections
// @access  Private
const getWishlistCollections = asyncHandler(async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.json(user.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Create a new wishlist collection
// @route   POST /api/wishlist/collections
// @access  Private
const createWishlistCollection = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name || name.trim() === '') {
    res.status(400);
    throw new Error("Collection name is required");
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if collection with this name already exists
    const collectionExists = user.wishlistCollections.some(
      (collection) => collection.name.toLowerCase() === name.toLowerCase()
    );

    if (collectionExists) {
      res.status(400);
      throw new Error("A collection with this name already exists");
    }

    // Create new collection
    user.wishlistCollections.push({ name, products: [] });
    await user.save();

    // Get updated collections
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    res.status(201).json(updatedUser.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Delete a wishlist collection
// @route   DELETE /api/wishlist/collections/:id
// @access  Private
const deleteWishlistCollection = asyncHandler(async (req, res) => {
  const collectionId = req.params.id;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Check if collection exists
    const collectionIndex = user.wishlistCollections.findIndex(
      (collection) => collection._id.toString() === collectionId
    );

    if (collectionIndex === -1) {
      res.status(404);
      throw new Error("Collection not found");
    }

    // Remove collection
    user.wishlistCollections.splice(collectionIndex, 1);
    await user.save();

    // Get updated collections
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    res.json(updatedUser.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Add product to a wishlist collection
// @route   POST /api/wishlist/collections/:id/products
// @access  Private
const addProductToCollection = asyncHandler(async (req, res) => {
  const collectionId = req.params.id;
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

    // Find the collection
    const collection = user.wishlistCollections.id(collectionId);
    if (!collection) {
      res.status(404);
      throw new Error("Collection not found");
    }

    // Check if product is already in collection
    if (collection.products.includes(productId)) {
      res.status(400);
      throw new Error("Product already in this collection");
    }

    // Add to collection
    collection.products.push(productId);
    await user.save();

    // Get updated collections
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    res.status(201).json(updatedUser.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Remove product from a wishlist collection
// @route   DELETE /api/wishlist/collections/:id/products/:productId
// @access  Private
const removeProductFromCollection = asyncHandler(async (req, res) => {
  const collectionId = req.params.id;
  const productId = req.params.productId;

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Find the collection
    const collection = user.wishlistCollections.id(collectionId);
    if (!collection) {
      res.status(404);
      throw new Error("Collection not found");
    }

    // Check if product is in collection
    const productIndex = collection.products.findIndex(
      (id) => id.toString() === productId
    );
    
    if (productIndex === -1) {
      res.status(400);
      throw new Error("Product not in this collection");
    }

    // Remove from collection
    collection.products.splice(productIndex, 1);
    await user.save();

    // Get updated collections
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    res.json(updatedUser.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Move product between collections
// @route   PUT /api/wishlist/collections/:id/products/:productId/move
// @access  Private
const moveProductBetweenCollections = asyncHandler(async (req, res) => {
  const sourceCollectionId = req.params.id;
  const productId = req.params.productId;
  const { targetCollectionId } = req.body;

  if (!targetCollectionId) {
    res.status(400);
    throw new Error("Target collection ID is required");
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    // Find source collection
    const sourceCollection = user.wishlistCollections.id(sourceCollectionId);
    if (!sourceCollection) {
      res.status(404);
      throw new Error("Source collection not found");
    }

    // Find target collection
    const targetCollection = user.wishlistCollections.id(targetCollectionId);
    if (!targetCollection) {
      res.status(404);
      throw new Error("Target collection not found");
    }

    // Check if product is in source collection
    const productIndex = sourceCollection.products.findIndex(
      (id) => id.toString() === productId
    );
    
    if (productIndex === -1) {
      res.status(400);
      throw new Error("Product not in source collection");
    }

    // Check if product is already in target collection
    if (targetCollection.products.includes(productId)) {
      res.status(400);
      throw new Error("Product already in target collection");
    }

    // Remove from source collection
    sourceCollection.products.splice(productIndex, 1);
    
    // Add to target collection
    targetCollection.products.push(productId);
    
    await user.save();

    // Get updated collections
    const updatedUser = await User.findById(req.user._id).populate({
      path: "wishlistCollections.products",
      select: "name price image images countInStock rating numReviews discountPercentage",
    });

    res.json(updatedUser.wishlistCollections);
  } catch (error) {
    res.status(500);
    throw new Error("Server error: " + error.message);
  }
});

// @desc    Add product to wishlist
// @route   POST /api/wishlist
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId, collectionId } = req.body;

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

    // If collection ID is provided, add to that collection
    if (collectionId) {
      const collection = user.wishlistCollections.id(collectionId);
      if (!collection) {
        res.status(404);
        throw new Error("Collection not found");
      }

      // Check if product is already in collection
      if (collection.products.includes(productId)) {
        res.status(400);
        throw new Error("Product already in this collection");
      }

      // Add to collection
      collection.products.push(productId);
    } else {
      // Check if product is already in main wishlist
      if (user.wishlist.includes(productId)) {
        res.status(400);
        throw new Error("Product already in wishlist");
      }

      // Add to main wishlist
      user.wishlist.push(productId);
    }

    await user.save();

    // Return appropriate data based on where the product was added
    if (collectionId) {
      // Get updated collections
      const updatedUser = await User.findById(req.user._id).populate({
        path: "wishlistCollections.products",
        select: "name price image images countInStock rating numReviews discountPercentage",
      });
      res.status(201).json(updatedUser.wishlistCollections);
    } else {
      // Get updated wishlist
      const updatedUser = await User.findById(req.user._id).populate({
        path: "wishlist",
        select: "name price image images countInStock rating numReviews discountPercentage",
      });
      res.status(201).json(updatedUser.wishlist);
    }
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
      select: "name price image images countInStock rating numReviews discountPercentage",
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
  getWishlistCollections,
  createWishlistCollection,
  deleteWishlistCollection,
  addProductToCollection,
  removeProductFromCollection,
  moveProductBetweenCollections,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
};
