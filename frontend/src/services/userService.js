import axios from "axios";

// Admin functions

// Get all users - Admin only
export const getAllUsers = async () => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("Not authorized");
    }

    // Check if user is admin
    if (!user.isAdmin) {
      throw new Error("Not authorized as admin");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
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
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
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
    const { user: currentUser } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!currentUser || !currentUser.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${currentUser.token}`,
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
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    await axios.delete(`/api/users/${id}`, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
