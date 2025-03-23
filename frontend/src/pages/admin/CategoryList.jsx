import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FiEdit, FiTrash, FiPlus, FiAlertCircle } from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../../services/categoryService";
import { Button } from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { useAuth } from "../../hooks/useAuth";

const CategoryList = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  // Check if user is admin
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
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(err.message || "Failed to load categories");
      toast.error(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAddCategory = async (e) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to create a category");
        navigate("/login?redirect=admin/categories");
        return;
      }

      setLoading(true);
      console.log("User token:", user?.token);
      console.log("Form data for new category:", formData);

      await createCategory(formData);
      toast.success("Category added successfully");
      setFormData({ name: "", description: "", image: "" });
      setShowAddModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);

      if (err.message.includes("Authentication required")) {
        toast.error("Authentication issue. Please log out and log back in.");
      } else {
        toast.error(err.message || "Failed to add category");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (category) => {
    if (!isAuthenticated) {
      toast.error("Please log in to edit categories");
      navigate("/login?redirect=admin/categories");
      return;
    }

    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to update a category");
        navigate("/login?redirect=admin/categories");
        return;
      }

      setLoading(true);
      await updateCategory(selectedCategory._id, formData);
      toast.success("Category updated successfully");
      setShowEditModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error updating category:", err);

      if (err.message.includes("Authentication required")) {
        toast.error("Authentication issue. Please log out and log back in.");
      } else {
        toast.error(err.message || "Failed to update category");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (category) => {
    if (!isAuthenticated) {
      toast.error("Please log in to delete categories");
      navigate("/login?redirect=admin/categories");
      return;
    }

    setSelectedCategory(category);
    setShowDeleteModal(true);
  };

  const handleDeleteCategory = async () => {
    try {
      if (!isAuthenticated) {
        toast.error("Please log in to delete a category");
        navigate("/login?redirect=admin/categories");
        return;
      }

      setLoading(true);
      await deleteCategory(selectedCategory._id);
      toast.success("Category deleted successfully");
      setShowDeleteModal(false);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);

      if (err.message.includes("Authentication required")) {
        toast.error("Authentication issue. Please log out and log back in.");
      } else {
        toast.error(err.message || "Failed to delete category");
      }
    } finally {
      setLoading(false);
    }
  };

  // If not authenticated, show prompt to login
  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-red-500 mb-4 text-xl">
            <FiAlertCircle className="inline-block mr-2 h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">
            You need to be logged in as an admin to manage categories.
          </p>
          <Link
            to="/login?redirect=admin/categories"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
          >
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading && categories.length === 0) {
    return (
      <div className="flex items-center justify-center p-8">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Categories</h1>
        <Button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2"
        >
          <FiPlus /> Add Category
        </Button>
      </div>

      {error && (
        <div className="mb-6 rounded-md bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Description
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-background">
              {categories.map((category) => (
                <motion.tr
                  key={category._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <div className="flex items-center">
                      {category.image && (
                        <img
                          src={category.image}
                          alt={category.name}
                          className="mr-3 h-10 w-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/100x100?text=Category";
                          }}
                        />
                      )}
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {category.slug}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="max-w-xs truncate">
                      {category.description || "-"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditClick(category)}
                      className="mr-2 text-blue-600 hover:text-blue-900"
                    >
                      <FiEdit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(category)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <FiTrash size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
              {categories.length === 0 && !loading && (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center">
                    <div className="py-8 text-gray-500">
                      No categories found. Add your first category!
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Add New Category</h2>
            <form onSubmit={handleAddCategory}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Add Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Category</h2>
            <form onSubmit={handleUpdateCategory}>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                  rows="3"
                />
              </div>
              <div className="mb-4">
                <label className="mb-2 block text-sm font-medium">
                  Image URL
                </label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Update Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Confirm Delete</h2>
            <p className="mb-6">
              Are you sure you want to delete the category "
              {selectedCategory.name}"? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteCategory}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryList;
