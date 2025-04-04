import axios from "axios";

// Helper function to get auth config
const getAuthConfig = () => {
  const userJSON = localStorage.getItem("auth-storage");
  if (!userJSON) {
    throw new Error("Authentication required");
  }

  try {
    const user = JSON.parse(userJSON);
    if (!user.state || !user.state.user || !user.state.user.token) {
      throw new Error("Authentication required");
    }

    return {
      headers: {
        Authorization: `Bearer ${user.state.user.token}`,
      },
    };
  } catch (error) {
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

// Get user's wishlist collections
export const getWishlistCollections = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.get("/api/wishlist/collections", config);
    return data; // Backend returns an array of wishlist collections
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Create a new wishlist collection
export const createWishlistCollection = async (name) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      "/api/wishlist/collections",
      { name },
      config
    );
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Delete a wishlist collection
export const deleteWishlistCollection = async (collectionId) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete(
      `/api/wishlist/collections/${collectionId}`,
      config
    );
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Add product to a collection
export const addProductToCollection = async (collectionId, productId) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post(
      `/api/wishlist/collections/${collectionId}/products`,
      { productId },
      config
    );
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Remove product from a collection
export const removeProductFromCollection = async (collectionId, productId) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete(
      `/api/wishlist/collections/${collectionId}/products/${productId}`,
      config
    );
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Move product between collections
export const moveProductBetweenCollections = async (
  sourceCollectionId,
  productId,
  targetCollectionId
) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    
    // We'll use a two-step approach for more reliability
    // Step 1: Add to target collection
    await axios.post(
      `/api/wishlist/collections/${targetCollectionId}/products`,
      { productId },
      config
    );
    
    // Step 2: Remove from source collection
    const { data } = await axios.delete(
      `/api/wishlist/collections/${sourceCollectionId}/products/${productId}`,
      config
    );
    
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Add product to wishlist
export const addToWishlist = async (productId, collectionId = null) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    
    const requestBody = collectionId 
      ? { productId, collectionId }
      : { productId };
      
    const { data } = await axios.post("/api/wishlist", requestBody, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Remove product from wishlist
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

// Clear entire wishlist
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
