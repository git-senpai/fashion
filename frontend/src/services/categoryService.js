import axios from "axios";

const API_URL = "/api/categories";

// Helper function to get auth token from local storage
const getAuthConfig = () => {
  const userJSON = localStorage.getItem("user");
  if (!userJSON) {
    throw new Error("Authentication required");
  }

  try {
    const user = JSON.parse(userJSON);
    if (!user || !user.token) {
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
    throw new Error("Authentication required");
  }
};

// Get all categories
const getCategories = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single category
const getCategoryById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create category
const createCategory = async (categoryData) => {
  const config = getAuthConfig();
  const response = await axios.post(API_URL, categoryData, config);
  return response.data;
};

// Update category
const updateCategory = async (id, categoryData) => {
  const config = getAuthConfig();
  const response = await axios.put(`${API_URL}/${id}`, categoryData, config);
  return response.data;
};

// Delete category
const deleteCategory = async (id) => {
  const config = getAuthConfig();
  const response = await axios.delete(`${API_URL}/${id}`, config);
  return response.data;
};

const categoryService = {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
};

export default categoryService;
