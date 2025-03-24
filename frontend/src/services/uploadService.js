import axios from "axios";

// Function to upload a file
export const uploadImage = async (file, token) => {
  try {
    if (!token) {
      const userJSON = localStorage.getItem("user");
      if (userJSON) {
        const user = JSON.parse(userJSON);
        token = user.token;
      }

      if (!token) {
        throw new Error("Authentication required");
      }
    }

    // Create form data for file upload
    const formData = new FormData();
    formData.append("image", file);

    const config = {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    };

    console.log(
      "Uploading image with token:",
      token ? "Token exists" : "No token"
    );
    const { data } = await axios.post("/api/upload", formData, config);

    if (!data || !data.image) {
      console.error("Upload response missing image URL:", data);
      throw new Error("Invalid upload response");
    }

    console.log("Image uploaded successfully:", data.image);
    return data;
  } catch (error) {
    console.error("Image upload error:", error);
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
