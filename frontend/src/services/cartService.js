import axios from "axios";

// Helper function to get auth token from local storage
const getAuthConfig = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");

    if (!authStorage) {
      console.error("Auth storage not found");
      throw new Error("Authentication required");
    }

    let parsedStorage;
    try {
      parsedStorage = JSON.parse(authStorage);
    } catch (parseError) {
      console.error("Failed to parse auth storage", parseError);
      throw new Error("Authentication data corrupted");
    }

    const { user } = parsedStorage || { user: null };

    if (!user || !user.token) {
      console.error("User token not found in auth storage");
      throw new Error("Authentication required - please log in");
    }

    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };
  } catch (error) {
    console.error("Error getting auth config:", error);
    throw error;
  }
};

// Get user's cart from the server
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
    const config = getAuthConfig();
    const { data } = await axios.post(
      "/api/cart",
      {
        productId,
        quantity,
      },
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

// Update a cart item quantity
export const updateCartItem = async (productId, quantity) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.put(
      `/api/cart/${productId}`,
      {
        quantity,
      },
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
    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Sync the local cart with the server
export const syncCart = async (cartItems) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.post("/api/cart/sync", { cartItems }, config);

    // Process validation messages if any
    if (data.validationMessages && data.validationMessages.length > 0) {
      // Log validation issues
      console.log("Cart sync validation messages:", data.validationMessages);

      // Group validation messages by type
      const outOfStock = [];
      const nonExistent = [];
      const quantityAdjusted = [];
      const otherIssues = [];

      data.validationMessages.forEach((message) => {
        if (message.message.includes("out of stock")) {
          outOfStock.push(message);
        } else if (message.message.includes("no longer exists")) {
          nonExistent.push(message);
        } else if (message.message.includes("Quantity adjusted")) {
          quantityAdjusted.push(message);
        } else {
          otherIssues.push(message);
        }
      });

      // Return validation summary with the cart items
      return {
        cartItems: data.cartItems,
        validationSummary: {
          outOfStock: outOfStock.length > 0 ? outOfStock : undefined,
          nonExistent: nonExistent.length > 0 ? nonExistent : undefined,
          quantityAdjusted:
            quantityAdjusted.length > 0 ? quantityAdjusted : undefined,
          otherIssues: otherIssues.length > 0 ? otherIssues : undefined,
        },
      };
    }

    return data.cartItems;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};
