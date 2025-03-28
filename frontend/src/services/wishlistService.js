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

// Get user's wishlist
export const getWishlist = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.get("/api/wishlist", config);
    return data; // Backend returns an array of wishlist items
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Add a product to the wishlist
export const addToWishlist = async (productId) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };

    if (!productId) {
      throw new Error("Product ID is required");
    }

    const { data } = await axios.post("/api/wishlist", { productId }, config);
    return data; // Backend returns updated wishlist
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Remove an item from the wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const config = getAuthConfig();

    if (!productId) {
      throw new Error("Product ID is required");
    }

    const { data } = await axios.delete(`/api/wishlist/${productId}`, config);
    return data; // Backend returns updated wishlist
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Clear the entire wishlist
export const clearWishlist = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete("/api/wishlist", config);
    return data; // Backend returns empty array
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};
