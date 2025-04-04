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

// Get all addresses for the current user
export const getAddresses = async () => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.get("/api/addresses", config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Create a new address
export const createAddress = async (addressData) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.post("/api/addresses", addressData, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Update an existing address
export const updateAddress = async (id, addressData) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(`/api/addresses/${id}`, addressData, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Delete an address
export const deleteAddress = async (id) => {
  try {
    const config = getAuthConfig();
    const { data } = await axios.delete(`/api/addresses/${id}`, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
};

// Set an address as default
export const setDefaultAddress = async (id) => {
  try {
    const config = {
      ...getAuthConfig(),
      headers: {
        ...getAuthConfig().headers,
        "Content-Type": "application/json",
      },
    };
    const { data } = await axios.put(`/api/addresses/${id}/default`, {}, config);
    return data;
  } catch (error) {
    const message =
      error.response && error.response.data.message
        ? error.response.data.message
        : error.message;
    throw new Error(message);
  }
}; 