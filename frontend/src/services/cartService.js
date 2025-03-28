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
export const addToCart = async (productId, quantity = 1) => {
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

    const { data } = await axios.post(
      "/api/cart",
      { productId, quantity: parsedQuantity },
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
export const updateCartItem = async (productId, quantity) => {
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
      { quantity: parsedQuantity },
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
export const removeFromCart = async (productId) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete(`/api/cart/${productId}`, config);
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

    // Format cart items for sync
    const itemsToSync = cartItems.map((item) => ({
      productId: item._id,
      quantity: item.quantity,
    }));

    const { data } = await axios.post(
      "/api/cart/sync",
      { items: itemsToSync },
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
