import axios from "axios";

// Helper function to safely get auth token
const getAuthToken = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return null;

    const parsed = JSON.parse(authStorage);
    if (
      !parsed ||
      !parsed.state ||
      !parsed.state.user ||
      !parsed.state.user.token
    ) {
      return null;
    }

    return {
      token: parsed.state.user.token,
      isAdmin: parsed.state.user.isAdmin === true,
      user: parsed.state.user,
    };
  } catch (error) {
    console.error("Error getting auth token:", error);
    return null;
  }
};

// Admin functions

// Get all users - Admin only
export const getAllUsers = async () => {
  try {
    const auth = getAuthToken();

    if (!auth || !auth.token) {
      throw new Error("Not authorized");
    }

    // Check if user is admin
    if (!auth.isAdmin) {
      throw new Error("Not authorized as admin");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    };

    const { data } = await axios.get("/api/users", config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Get user by ID - Admin only
export const getUserById = async (id) => {
  try {
    const auth = getAuthToken();

    if (!auth || !auth.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    };

    const { data } = await axios.get(`/api/users/${id}`, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Update user - Admin only
export const updateUser = async (user) => {
  try {
    const auth = getAuthToken();

    if (!auth || !auth.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
    };

    const { data } = await axios.put(`/api/users/${user._id}`, user, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Delete user - Admin only
export const deleteUser = async (id) => {
  try {
    const auth = getAuthToken();

    if (!auth || !auth.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    };

    await axios.delete(`/api/users/${id}`, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Get all users stats - Admin only
export const getUserStats = async () => {
  try {
    const auth = getAuthToken();

    if (!auth || !auth.token) {
      throw new Error("Not authorized");
    }

    // Check if user is admin
    if (!auth.isAdmin) {
      throw new Error("Not authorized as admin");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${auth.token}`,
      },
    };

    const { data } = await axios.get("/api/users/stats", config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
