import axios from "axios";

const API_URL = "/api/sizes";

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

// Get all sizes
const getSizes = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

// Get single size
const getSizeById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`);
  return response.data;
};

// Create size
const createSize = async (sizeData) => {
  const config = getAuthConfig();
  const response = await axios.post(API_URL, sizeData, config);
  return response.data;
};

// Update size
const updateSize = async (id, sizeData) => {
  const config = getAuthConfig();
  const response = await axios.put(`${API_URL}/${id}`, sizeData, config);
  return response.data;
};

// Delete size
const deleteSize = async (id) => {
  try {
    const config = getAuthConfig();
    const response = await axios.delete(`${API_URL}/${id}`, config);
    return response.data;
  } catch (error) {
    console.error("Delete size error:", error);
    throw error;
  }
};

const sizeService = {
  getSizes,
  getSizeById,
  createSize,
  updateSize,
  deleteSize,
};

export default sizeService; 