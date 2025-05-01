import axios from "axios";

// Use environment variable if available, otherwise use the correct backend URL
const API_URL =
  import.meta.env.VITE_API_URL || "https://fashion-backend-0z51.onrender.com";

// Log the API URL being used
console.log("API URL configured as:", API_URL);

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export default axios;
