import axios from "axios";

// Function to get all products
export const getProducts = async (keyword = "", pageNumber = "") => {
  try {
    console.log(
      `Calling API: /api/products?keyword=${keyword}&pageNumber=${pageNumber}`
    );
    const { data } = await axios.get(
      `/api/products?keyword=${keyword}&pageNumber=${pageNumber}`
    );

    console.log("API response data:", data);

    // Validate response data structure
    if (!data) {
      throw new Error("API returned empty response");
    }

    // If data is an array, return it directly
    if (Array.isArray(data)) {
      return data;
    }

    // If data has a products property and it's an array, return the whole object
    if (data.products && Array.isArray(data.products)) {
      return data;
    }

    // Unexpected format
    throw new Error(
      `Unexpected API response format: ${JSON.stringify(data).substring(
        0,
        100
      )}...`
    );
  } catch (error) {
    console.error("getProducts error:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to get product details
export const getProductDetails = async (id) => {
  try {
    console.log(`Fetching product details for ID: ${id}`);
    if (!id) {
      throw new Error("Product ID is required");
    }

    // Always return a template object for "new" ID
    if (id === "new") {
      console.log("Creating new product, returning empty template");
      return {
        _id: "new",
        name: "",
        price: 0,
        brand: "",
        category: "",
        countInStock: 0,
        description: "",
        images: [],
      };
    }

    const response = await axios.get(`/api/products/${id}`);
    console.log(`Product details API response:`, response);

    if (!response.data) {
      throw new Error("No data returned from API");
    }

    // If the response doesn't have the expected product data
    if (!response.data._id) {
      console.error("Invalid product data received:", response.data);
      throw new Error("Invalid product data received");
    }

    // If the product has images but they're empty strings, set to empty array
    if (response.data.images) {
      response.data.images = response.data.images.filter(
        (img) => img && img.trim() !== ""
      );

      // If array is empty after filtering, make sure main image is included if available
      if (response.data.images.length === 0 && response.data.image) {
        response.data.images = [response.data.image];
      }
    }

    return response.data;
  } catch (error) {
    console.error("Error fetching product details:", error);

    // Handle special case for "new" id to avoid error
    if (id === "new") {
      return {
        _id: "new",
        name: "",
        price: 0,
        brand: "",
        category: "",
        countInStock: 0,
        description: "",
        images: [],
      };
    }

    // Provide more descriptive error messages based on the HTTP status
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      if (error.response.status === 404) {
        throw new Error("Product not found");
      } else {
        throw new Error(
          error.response.data?.message ||
            `Server error: ${error.response.status}`
        );
      }
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error("No response from server. Please check your connection.");
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || "Failed to fetch product details");
    }
  }
};

// Function to get top products
export const getTopProducts = async () => {
  try {
    const { data } = await axios.get("/api/products/top");
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to get featured products
export const getFeaturedProducts = async () => {
  try {
    const { data } = await axios.get("/api/products/featured");
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to create a product review
export const createProductReview = async (productId, review, token) => {
  try {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.post(`/api/products/${productId}/reviews`, review, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to get user wishlist
export const getWishlist = async () => {
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

    const { data } = await axios.get("/api/users/wishlist", config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to add to wishlist
export const addToWishlist = async (productId) => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error("You must be logged in to add items to your wishlist");
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${user.token}`,
      },
    };

    const { data } = await axios.post(
      "/api/users/wishlist",
      { productId },
      config
    );
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to remove from wishlist
export const removeFromWishlist = async (productId) => {
  try {
    const { user } = JSON.parse(
      localStorage.getItem("auth-storage") || '{"user":null}'
    );

    if (!user || !user.token) {
      throw new Error(
        "You must be logged in to remove items from your wishlist"
      );
    }

    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
      },
    };

    await axios.delete(`/api/users/wishlist/${productId}`, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Admin functions

// Function to delete a product
export const deleteProduct = async (id, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.delete(`/api/products/${id}`, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to create a product
export const createProduct = async (productData, token) => {
  try {
    // Ensure token is available
    if (!token) {
      const userJSON = localStorage.getItem("user");
      if (userJSON) {
        try {
          const user = JSON.parse(userJSON);
          token = user.token;
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }

      if (!token) {
        throw new Error("Authentication required");
      }
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    // Deep clone the product data to avoid modifying the original
    const productToCreate = JSON.parse(JSON.stringify(productData));

    // Always remove the _id field for new products
    if (productToCreate._id) {
      delete productToCreate._id;
    }

    // Make sure all required fields are included with their default values
    const newProduct = {
      name: productToCreate.name || "New Product",
      brand: productToCreate.brand || "Brand",
      category: productToCreate.category || "Category",
      description: productToCreate.description || "Description",
      price: Number(productToCreate.price || 0),
      countInStock: Number(productToCreate.countInStock || 0),
      images: productToCreate.images || [],
    };

    console.log("Creating product with data:", newProduct);
    const { data } = await axios.post("/api/products", newProduct, config);
    console.log("Product created:", data);
    return data;
  } catch (error) {
    console.error("Create product error:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to update a product
export const updateProduct = async (product, token) => {
  try {
    // Ensure token is available
    if (!token) {
      const userJSON = localStorage.getItem("user");
      if (userJSON) {
        try {
          const user = JSON.parse(userJSON);
          token = user.token;
        } catch (e) {
          console.error("Error parsing user JSON:", e);
        }
      }

      if (!token) {
        throw new Error("Authentication required");
      }
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    };

    // Ensure the product has a valid ID
    if (!product._id || product._id === "new") {
      throw new Error("Product ID is required for updates");
    }

    // Create a clean copy of the product data
    const productToUpdate = { ...product };

    // Ensure numeric fields are properly formatted
    productToUpdate.price = Number(productToUpdate.price || 0);
    productToUpdate.countInStock = Number(productToUpdate.countInStock || 0);

    console.log("Updating product with data:", productToUpdate);
    const { data } = await axios.put(
      `/api/products/${productToUpdate._id}`,
      productToUpdate,
      config
    );
    console.log("Product updated:", data);
    return data;
  } catch (error) {
    console.error("Update product error:", error);
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Admin function to get all products without pagination
export const getAllProducts = async () => {
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

    // Use the regular products endpoint
    const { data } = await axios.get("/api/products", config);
    return Array.isArray(data.products) ? data.products : [];
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
