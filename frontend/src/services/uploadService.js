import axios from "axios";

// Function to upload a file
export const uploadImage = async (file, token) => {
  try {
    // Create form data for file upload
    const formData = new FormData();
    formData.append("image", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    const { data } = await axios.post("/api/upload", formData, config);
    return data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};

// Function to delete an image
export const deleteImage = async (publicId, token) => {
  try {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    await axios.delete(`/api/upload/${publicId}`, config);
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message);
  }
};
