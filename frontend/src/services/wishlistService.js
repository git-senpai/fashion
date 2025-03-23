import axios from "axios";

// Helper function to get auth token from local storage
const getAuthConfig = () => {
  const authStorage = localStorage.getItem("auth-storage");
  const { user } = authStorage ? JSON.parse(authStorage) : { user: null };

  if (!user || !user.token) {
    throw new Error("Authentication required");
  }

  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
};

// Get user's wishlist
export const getWishlist = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.get("/api/wishlist", config);
    return data;
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

    const { data } = await axios.post("/api/wishlist", { productId }, config);
    return data;
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
    const { data } = await axios.delete(`/api/wishlist/${productId}`, config);
    return data;
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
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};
