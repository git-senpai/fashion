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
      console.error("User token not found in auth storage", parsedStorage);
      throw new Error("Authentication required - please log in");
    }

    return {
      headers: {
        Authorization: `Bearer ${user.token}`,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error("Error getting auth config:", error);
    throw error;
  }
};

// Get all categories
export const getCategories = async () => {
  try {
    const { data } = await axios.get("/api/categories");
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Get category by ID
export const getCategoryById = async (id) => {
  try {
    const { data } = await axios.get(`/api/categories/${id}`);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Create a new category (admin only)
export const createCategory = async (categoryData) => {
  try {
    const config = getAuthConfig();
    console.log("Creating category with config:", config);
    const { data } = await axios.post("/api/categories", categoryData, config);
    return data;
  } catch (error) {
    console.error("Create category error:", error);
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Update a category (admin only)
export const updateCategory = async (id, categoryData) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.put(
      `/api/categories/${id}`,
      categoryData,
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

// Delete a category (admin only)
export const deleteCategory = async (id) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete(`/api/categories/${id}`, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};
