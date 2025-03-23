import axios from "axios";

// Function to create a new order
export const createOrder = async (order) => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post("/api/orders", order, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to get order by ID
export const getOrderDetails = async (id) => {
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

    const { data } = await axios.get(`/api/orders/${id}`, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to pay for order
export const payOrder = async (orderId, paymentResult) => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("Not authorized");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.put(
      `/api/orders/${orderId}/pay`,
      paymentResult,
      config
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to get logged in user orders
export const getMyOrders = async () => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      return [];
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.get("/api/orders/myorders", config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Admin functions

// Function to get all orders (admin only)
export const getOrders = async () => {
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

    const { data } = await axios.get("/api/orders", config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to mark order as delivered (admin only)
export const deliverOrder = async (orderId) => {
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

    const { data } = await axios.put(
      `/api/orders/${orderId}/deliver`,
      {},
      config
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
