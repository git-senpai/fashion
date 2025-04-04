import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  FiEdit,
  FiTrash2,
  FiPlus,
  FiSearch,
  FiX,
  FiUpload,
} from "react-icons/fi";
import sizeService from "../../services/sizeService";
import Spinner from "../../components/ui/Spinner";
import Pagination from "../../components/ui/Pagination";

const SizeList = () => {
  const [sizes, setSizes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isActive: true,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSizes, setFilteredSizes] = useState([]);

  useEffect(() => {
    fetchSizes();
  }, []);

  useEffect(() => {
    if (sizes.length > 0) {
      const filtered = sizes.filter((size) => {
        return (
          size.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (size.description &&
            size.description.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      });
      setFilteredSizes(filtered);
      setTotalItems(filtered.length);
      setCurrentPage(1); // Reset to first page on filter change
    }
  }, [searchTerm, sizes]);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      const data = await sizeService.getSizes();
      setSizes(data);
      setFilteredSizes(data);
      setTotalItems(data.length);
    } catch (error) {
      toast.error("Failed to fetch sizes");
      console.error("Error fetching sizes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSize = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await sizeService.createSize(formData);
      toast.success("Size added successfully");
      resetForm();
      setShowAddModal(false);
      fetchSizes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add size");
      console.error("Error adding size:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSize = async (e) => {
    e.preventDefault();
    if (!selectedSize) return;

    try {
      setLoading(true);
      await sizeService.updateSize(selectedSize._id, formData);
      toast.success("Size updated successfully");
      setShowEditModal(false);
      fetchSizes();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update size");
      console.error("Error updating size:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSize = async () => {
    if (!selectedSize) return;

    try {
      setLoading(true);
      console.log("Deleting size with ID:", selectedSize._id);
      
      await sizeService.deleteSize(selectedSize._id);
      
      // Close dialog and refresh size list
      setShowDeleteDialog(false);
      toast.success(`Size "${selectedSize.name}" deleted successfully`);
      
      // Refresh the sizes list
      fetchSizes();
    } catch (error) {
      console.error("Error deleting size:", error);
      toast.error(error.response?.data?.message || "Failed to delete size");
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (size) => {
    setSelectedSize(size);
    setFormData({
      name: size.name,
      description: size.description || "",
      isActive: size.isActive,
    });
    setShowEditModal(true);
  };

  const openDeleteDialog = (size) => {
    setSelectedSize(size);
    setShowDeleteDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isActive: true,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Get current sizes for pagination
  const getCurrentItems = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return filteredSizes.slice(indexOfFirstItem, indexOfLastItem);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">Sizes</h1>
        <div className="mt-4 flex flex-wrap gap-2 md:mt-0">
          <div className="relative flex-grow max-w-xs">
            <input
              type="text"
              placeholder="Search sizes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-md border border-gray-300 pl-10 pr-3 py-2 focus:border-blue-500 focus:outline-none"
            />
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            <FiPlus className="mr-2" />
            Add Size
          </button>
        </div>
      </div>

      {loading && !sizes.length ? (
        <div className="flex h-64 items-center justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {getCurrentItems().length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      {searchTerm
                        ? "No sizes found matching your search"
                        : "No sizes found. Add your first size!"}
                    </td>
                  </tr>
                ) : (
                  getCurrentItems().map((size) => (
                    <tr
                      key={size._id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="whitespace-nowrap px-4 py-4 text-sm font-medium text-gray-900">
                        {size.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {size.description || "-"}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${
                            size.isActive
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {size.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-4 text-right text-sm font-medium">
                        <button
                          onClick={() => openEditModal(size)}
                          className="mr-2 text-blue-600 hover:text-blue-900"
                        >
                          <FiEdit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => openDeleteDialog(size)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FiTrash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalItems > itemsPerPage && (
            <div className="mt-6">
              <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Delete Size</h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete the size "{selectedSize.name}"? 
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteDialog(false)}
                className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteSize}
                className="rounded-md bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" /> : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Size Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Add New Size</h2>
            <form onSubmit={handleAddSize}>
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
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active (visible in product forms)
                  </span>
                </label>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowAddModal(false);
                  }}
                  className="rounded-md border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                  disabled={loading}
                >
                  {loading ? <Spinner size="sm" /> : "Add Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Size Modal */}
      {showEditModal && selectedSize && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
            <h2 className="mb-4 text-xl font-bold">Edit Size</h2>
            <form onSubmit={handleUpdateSize}>
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
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    Active (visible in product forms)
                  </span>
                </label>
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
                  {loading ? <Spinner size="sm" /> : "Update Size"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SizeList; 