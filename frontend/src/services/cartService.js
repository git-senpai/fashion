import axios from "axios";

// Helper function to get auth token from local storage
const getAuthConfig = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) {
      throw new Error("Authentication required");
    }

    const parsed = JSON.parse(authStorage);
    if (
      !parsed ||
      !parsed.state ||
      !parsed.state.user ||
      !parsed.state.user.token
    ) {
      throw new Error("Authentication required");
    }

    return {
      headers: {
        Authorization: `Bearer ${parsed.state.user.token}`,
      },
    };
  } catch (error) {
    console.error("Error getting auth config:", error);
    throw new Error("Authentication required");
  }
};

// Get user's cart
export const getCart = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.get("/api/cart", config);
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Add a product to the cart
export const addToCart = async (productId, quantity = 1, size = null) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };

    // Ensure quantity is an integer
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      throw new Error("Invalid quantity");
    }

    // Add the product to cart with optional size
    const { data } = await axios.post(
      "/api/cart",
      { productId, quantity: parsedQuantity, size },
      config
    );
    
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Update cart item quantity
export const updateCartItem = async (productId, quantity, size = null) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };

    // Ensure quantity is an integer
    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      throw new Error("Invalid quantity");
    }

    const { data } = await axios.put(
      `/api/cart/${productId}`,
      { quantity: parsedQuantity, size },
      config
    );
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Remove an item from the cart
export const removeFromCart = async (productId, size = null) => {
  try {
    const config = getAuthConfig();
    let url = `/api/cart/${productId}`;
    
    // Add size as query parameter if provided
    if (size) {
      url += `?size=${encodeURIComponent(size)}`;
    }
    
    const { data } = await axios.delete(url, config);
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Clear the entire cart
export const clearCart = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete("/api/cart", config);
    return data.cartItems || [];
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Sync local cart with server
export const syncCart = async (cartItems) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };

    // Format cart items for sync, including size information
    const itemsToSync = cartItems.map((item) => ({
      _id: item._id,
      quantity: item.quantity,
      size: item.size || null,
    }));

    const { data } = await axios.post(
      "/api/cart/sync",
      { cartItems: itemsToSync },
      config
    );
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};
