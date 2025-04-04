const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const Product = require("../models/productModel");

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image images countInStock sizeQuantities",
  });

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Transform cart items to include product details
  const cartItems = user.cart
    .map((item) => {
      // Check if product exists and has required fields
      if (!item.product || !item.product._id) {
        console.error(
          `Invalid product reference in cart: ${JSON.stringify(item)}`
        );
        return null;
      }

      // Get size-specific availability if size is specified
      let availableQuantity = item.product.countInStock || 0;
      if (item.size) {
        const sizeInfo = item.product.sizeQuantities.find(
          sq => sq.size === item.size
        );
        if (sizeInfo) {
          availableQuantity = sizeInfo.quantity;
        }
      }

      return {
        _id: item.product._id,
        name: item.product.name || "Product Name Unavailable",
        price: item.product.price || 0,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "https://placehold.co/100x100?text=No+Image",
        images: item.product.images || [],
        countInStock: availableQuantity,
        quantity: item.quantity,
        size: item.size || null,
      };
    })
    .filter(Boolean); // Remove any null items

  res.json({ cartItems });
});

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity, size } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error("Product ID is required");
  }

  // Validate quantity
  const parsedQuantity = parseInt(quantity) || 1;
  if (parsedQuantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Size-specific inventory check
  if (size) {
    // Find if this size exists in the product
    const sizeInfo = product.sizeQuantities.find(sq => sq.size === size);
    if (!sizeInfo) {
      res.status(400);
      throw new Error(`Size ${size} is not available for this product`);
    }
    
    // Check if specific size has enough stock
    if (sizeInfo.quantity < parsedQuantity) {
      res.status(400);
      throw new Error(`Only ${sizeInfo.quantity} items available for size ${size}`);
    }
  } else {
    // Check if product has enough total stock if no size specified
    if (product.countInStock < parsedQuantity) {
      res.status(400);
      throw new Error("Product is out of stock or has insufficient quantity");
    }
  }

  // Find user and update cart
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Check if product with the same size already exists in cart
  const existingCartItemIndex = user.cart.findIndex(
    (item) => 
      item.product.toString() === productId && 
      (size ? item.size === size : item.size === null)
  );

  if (existingCartItemIndex > -1) {
    // Product with same size exists in cart, update quantity
    user.cart[existingCartItemIndex].quantity += parsedQuantity;
  } else {
    // Product not in cart or different size, add it
    user.cart.push({
      product: productId,
      quantity: parsedQuantity,
      size: size || null,
    });
  }

  // Save user
  await user.save();

  // Return updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image images countInStock sizeQuantities",
  });

  // Transform cart items to include product details
  const cartItems = updatedUser.cart
    .map((item) => {
      // Check if product exists and has required fields
      if (!item.product || !item.product._id) {
        console.error(
          `Invalid product reference in cart: ${JSON.stringify(item)}`
        );
        return null;
      }

      // Get size-specific availability if size is specified
      let availableQuantity = item.product.countInStock || 0;
      if (item.size) {
        const sizeInfo = item.product.sizeQuantities.find(
          sq => sq.size === item.size
        );
        if (sizeInfo) {
          availableQuantity = sizeInfo.quantity;
        }
      }

      return {
        _id: item.product._id,
        name: item.product.name || "Product Name Unavailable",
        price: item.product.price || 0,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "https://placehold.co/100x100?text=No+Image",
        images: item.product.images || [],
        countInStock: availableQuantity,
        quantity: item.quantity,
        size: item.size || null,
      };
    })
    .filter(Boolean); // Remove any null items

  res.status(201).json({ cartItems });
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/:id
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { quantity, size } = req.body;

  // Validate quantity
  const parsedQuantity = parseInt(quantity);
  if (!parsedQuantity || parsedQuantity < 1) {
    res.status(400);
    throw new Error("Quantity must be at least 1");
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Size-specific inventory check
  if (size) {
    // Find if this size exists in the product
    const sizeInfo = product.sizeQuantities.find(sq => sq.size === size);
    if (!sizeInfo) {
      res.status(400);
      throw new Error(`Size ${size} is not available for this product`);
    }
    
    // Check if specific size has enough stock
    if (sizeInfo.quantity < parsedQuantity) {
      res.status(400);
      throw new Error(`Only ${sizeInfo.quantity} items available for size ${size}`);
    }
  } else {
    // Check if product is in stock
    if (product.countInStock < parsedQuantity) {
      res.status(400);
      throw new Error("Product is out of stock or has insufficient quantity");
    }
  }

  // Find user and update cart
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Find product in cart with matching size
  const cartItemIndex = user.cart.findIndex(
    (item) => 
      item.product.toString() === productId && 
      (size ? item.size === size : item.size === null)
  );

  if (cartItemIndex === -1) {
    res.status(404);
    throw new Error("Product not found in cart with specified size");
  }

  // Update quantity
  user.cart[cartItemIndex].quantity = parsedQuantity;

  // Save user
  await user.save();

  // Return updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image images countInStock sizeQuantities",
  });

  // Transform cart items to include product details
  const cartItems = updatedUser.cart
    .map((item) => {
      // Check if product exists and has required fields
      if (!item.product || !item.product._id) {
        console.error(
          `Invalid product reference in cart: ${JSON.stringify(item)}`
        );
        return null;
      }

      // Get size-specific availability if size is specified
      let availableQuantity = item.product.countInStock || 0;
      if (item.size) {
        const sizeInfo = item.product.sizeQuantities.find(
          sq => sq.size === item.size
        );
        if (sizeInfo) {
          availableQuantity = sizeInfo.quantity;
        }
      }

      return {
        _id: item.product._id,
        name: item.product.name || "Product Name Unavailable",
        price: item.product.price || 0,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "https://placehold.co/100x100?text=No+Image",
        images: item.product.images || [],
        countInStock: availableQuantity,
        quantity: item.quantity,
        size: item.size || null,
      };
    })
    .filter(Boolean); // Remove any null items

  res.json({ cartItems });
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/:id
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const productId = req.params.id;
  const { size } = req.query; // Get size from query params

  // Find user
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Filter out the product to be removed, considering size if provided
  if (size) {
    // If size is provided, only remove the specific product + size combination
    user.cart = user.cart.filter(
      item => !(item.product.toString() === productId && item.size === size)
    );
  } else {
    // If no size is provided, remove all instances of this product
    user.cart = user.cart.filter(item => item.product.toString() !== productId);
  }

  // Save user
  await user.save();

  // Return updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image images countInStock sizeQuantities",
  });

  // Transform cart items to include product details
  const cartItems = updatedUser.cart
    .map((item) => {
      // Check if product exists and has required fields
      if (!item.product || !item.product._id) {
        console.error(
          `Invalid product reference in cart: ${JSON.stringify(item)}`
        );
        return null;
      }

      // Get size-specific availability if size is specified
      let availableQuantity = item.product.countInStock || 0;
      if (item.size) {
        const sizeInfo = item.product.sizeQuantities.find(
          sq => sq.size === item.size
        );
        if (sizeInfo) {
          availableQuantity = sizeInfo.quantity;
        }
      }

      return {
        _id: item.product._id,
        name: item.product.name || "Product Name Unavailable",
        price: item.product.price || 0,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "https://placehold.co/100x100?text=No+Image",
        images: item.product.images || [],
        countInStock: availableQuantity,
        quantity: item.quantity,
        size: item.size || null,
      };
    })
    .filter(Boolean); // Remove any null items

  res.json({ cartItems });
});

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  // Find user and clear cart
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Clear cart
  user.cart = [];

  // Save user
  await user.save();

  res.json({ cartItems: [] });
});

// @desc    Sync local cart with database
// @route   POST /api/cart/sync
// @access  Private
const syncCart = asyncHandler(async (req, res) => {
  const { cartItems } = req.body;

  if (!cartItems || !Array.isArray(cartItems)) {
    res.status(400);
    throw new Error("Invalid cart data");
  }

  // Find user
  const user = await User.findById(req.user._id);
  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // Create new cart from local cart
  const newCart = [];
  const validationErrors = [];

  // Loop through local cart items and validate each one
  for (const item of cartItems) {
    try {
      const product = await Product.findById(item._id);

      // Skip if product doesn't exist
      if (!product) {
        validationErrors.push({
          productId: item._id,
          message: "Product no longer exists",
        });
        continue;
      }

      // If size is specified, check size-specific inventory
      if (item.size) {
        const sizeInfo = product.sizeQuantities.find(sq => sq.size === item.size);
        
        // If size doesn't exist, add error and skip
        if (!sizeInfo) {
          validationErrors.push({
            productId: item._id,
            name: product.name,
            message: `Size ${item.size} is not available for this product`,
          });
          continue;
        }
        
        // Check if specific size has enough inventory
        if (sizeInfo.quantity <= 0) {
          validationErrors.push({
            productId: item._id,
            name: product.name,
            message: `Size ${item.size} is out of stock`,
          });
          continue;
        }
        
        // Ensure quantity doesn't exceed available stock for this size
        const requestedQuantity = parseInt(item.quantity) || 1;
        const validQuantity = Math.min(requestedQuantity, sizeInfo.quantity);
        
        if (validQuantity !== requestedQuantity) {
          validationErrors.push({
            productId: item._id,
            name: product.name,
            message: `Quantity for size ${item.size} adjusted to ${validQuantity} due to stock limitations`,
          });
        }
        
        if (validQuantity > 0) {
          newCart.push({
            product: item._id,
            quantity: validQuantity,
            size: item.size,
          });
        }
      } else {
        // If no size specified, check general inventory
        // Check if product is in stock
        if (product.countInStock <= 0) {
          validationErrors.push({
            productId: item._id,
            name: product.name,
            message: "Product is out of stock",
          });
          continue;
        }

        // Ensure quantity is valid and doesn't exceed stock
        const requestedQuantity = parseInt(item.quantity) || 1;
        const validQuantity = Math.min(requestedQuantity, product.countInStock);

        if (validQuantity !== requestedQuantity) {
          validationErrors.push({
            productId: item._id,
            name: product.name,
            message: `Quantity adjusted to ${validQuantity} due to stock limitations`,
          });
        }

        if (validQuantity > 0) {
          newCart.push({
            product: item._id,
            quantity: validQuantity,
            size: null,
          });
        }
      }
    } catch (error) {
      console.error(`Error processing cart item ${item._id}:`, error);
      validationErrors.push({
        productId: item._id,
        message: "Error validating product",
      });
    }
  }

  // Replace user's cart with the new cart
  user.cart = newCart;

  // Save user
  await user.save();

  // Return updated cart
  const updatedUser = await User.findById(req.user._id).populate({
    path: "cart.product",
    select: "name price image images countInStock sizeQuantities",
  });

  // Transform cart items to include product details
  const syncedCartItems = updatedUser.cart
    .map((item) => {
      // Check if product exists and has required fields
      if (!item.product || !item.product._id) {
        console.error(
          `Invalid product reference in cart: ${JSON.stringify(item)}`
        );
        return null;
      }

      // Get size-specific availability if size is specified
      let availableQuantity = item.product.countInStock || 0;
      if (item.size) {
        const sizeInfo = item.product.sizeQuantities.find(
          sq => sq.size === item.size
        );
        if (sizeInfo) {
          availableQuantity = sizeInfo.quantity;
        }
      }

      return {
        _id: item.product._id,
        name: item.product.name || "Product Name Unavailable",
        price: item.product.price || 0,
        image:
          item.product.image ||
          item.product.images?.[0] ||
          "https://placehold.co/100x100?text=No+Image",
        images: item.product.images || [],
        countInStock: availableQuantity,
        quantity: item.quantity,
        size: item.size || null,
      };
    })
    .filter(Boolean); // Remove any null items

  // Include validation errors in response
  res.json({
    cartItems: syncedCartItems,
    validationMessages:
      validationErrors.length > 0 ? validationErrors : undefined,
  });
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  syncCart,
};
