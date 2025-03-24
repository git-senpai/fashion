import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { FiSave, FiX, FiUpload } from "react-icons/fi";
import categoryService from "../../services/categoryService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import axios from "axios";

const CategoryEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const isEditMode = Boolean(id);
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
    isActive: true,
  });
  const [previewImage, setPreviewImage] = useState("");

  // Check authentication
  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access admin features");
      navigate("/login?redirect=admin/categories");
      return;
    }

    if (user && !user.isAdmin) {
      toast.error("You don't have permission to access this page");
      navigate("/");
    }

    // Store token in localStorage for categoryService to access
    if (user && user.token) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isEditMode) {
      fetchCategory();
    }
  }, [isEditMode, id]);

  useEffect(() => {
    // Set preview image when form data changes
    if (formData.image) {
      setPreviewImage(formData.image);
    }
  }, [formData.image]);

  const fetchCategory = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategoryById(id);
      setFormData(data);
      if (data.image) {
        setPreviewImage(data.image);
      }
    } catch (error) {
      toast.error("Error fetching category");
      navigate("/admin/categories");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const uploadFileHandler = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      setUploadLoading(true);

      // Get auth token for upload
      const token = user?.token;
      if (!token) {
        throw new Error("Authentication required");
      }

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      };

      const { data } = await axios.post("/api/upload", formData, config);

      if (data.success) {
        setFormData((prev) => ({
          ...prev,
          image: data.image,
        }));
        setPreviewImage(data.image);
        toast.success("Image uploaded successfully");
      } else {
        throw new Error(data.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditMode) {
        await categoryService.updateCategory(id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.createCategory(formData);
        toast.success("Category created successfully");
      }
      navigate("/admin/categories");
    } catch (error) {
      toast.error(error.response?.data?.message || "Error saving category");
      setLoading(false);
    }
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isEditMode ? "Edit Category" : "Add New Category"}
          </h1>
          <Button
            variant="outline"
            onClick={() => navigate("/admin/categories")}
            className="flex items-center gap-2"
          >
            <FiX className="h-4 w-4" />
            Cancel
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Image
            </label>
            <div className="mt-1 flex items-center">
              {previewImage && (
                <div className="relative mr-4">
                  <img
                    src={previewImage}
                    alt="Category preview"
                    className="h-32 w-32 object-cover rounded-md"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://placehold.co/100x100?text=Error";
                    }}
                  />
                </div>
              )}
              <div className="flex flex-col space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={uploadFileHandler}
                  className="hidden"
                  accept="image/*"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current.click()}
                  className="flex items-center gap-2"
                  disabled={uploadLoading}
                >
                  <FiUpload className="h-4 w-4" />
                  {uploadLoading ? "Uploading..." : "Upload Image"}
                </Button>
                <div className="text-sm text-gray-500">Or enter image URL:</div>
                <input
                  type="text"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label
              htmlFor="isActive"
              className="ml-2 block text-sm text-gray-900"
            >
              Active
            </label>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loading || uploadLoading}
              className="flex items-center gap-2"
            >
              <FiSave className="h-4 w-4" />
              {loading ? "Saving..." : isEditMode ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoryEdit;
