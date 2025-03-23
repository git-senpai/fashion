import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiSave,
  FiCamera,
  FiXCircle,
  FiPlus,
} from "react-icons/fi";
import {
  getProductDetails,
  updateProduct,
  createProduct,
} from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { uploadImage } from "../../services/uploadService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../../components/ui/Form";

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    price: 0,
    brand: "",
    category: "",
    countInStock: 0,
    description: "",
    image: "",
    images: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [additionalImageFile, setAdditionalImageFile] = useState(null);
  const [additionalImagePreview, setAdditionalImagePreview] = useState("");
  const [uploadingAdditionalImage, setUploadingAdditionalImage] =
    useState(false);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        toast.error("Failed to load categories");
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getProductDetails(id);
        setProduct({
          ...data,
          images: data.images || [],
          image: data.image || "",
        });
      } catch (err) {
        setError(err.message || "Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    if (id !== "new") {
      fetchProduct();
    } else {
      // Create new product mode - set defaults for required fields
      setProduct({
        name: "New Product",
        price: 0,
        brand: "Brand",
        category: "Category",
        countInStock: 0,
        description: "Product description",
        image: "https://placehold.co/600x400?text=Product+Image",
        images: [],
      });
      setLoading(false);
    }
  }, [id]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    let parsedValue = value;

    // Handle numeric values
    if (name === "price" || name === "countInStock") {
      parsedValue = value === "" ? 0 : Number(value);
    }

    setProduct({ ...product, [name]: parsedValue });
  };

  // Handle main image upload preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle additional image upload preview
  const handleAdditionalImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAdditionalImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAdditionalImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Add additional image to product
  const handleAddAdditionalImage = async () => {
    if (!additionalImageFile) return;

    try {
      setUploadingAdditionalImage(true);
      const uploadResult = await uploadImage(additionalImageFile, user.token);

      if (uploadResult && uploadResult.image) {
        // Create a copy of the current images array
        const updatedImages = Array.isArray(product.images)
          ? [...product.images]
          : [];

        // Add the new image if it's not already in the array
        if (!updatedImages.includes(uploadResult.image)) {
          updatedImages.push(uploadResult.image);
        }

        // Update the product state with the new images array
        setProduct({
          ...product,
          images: updatedImages,
        });

        // Clear the additional image input
        setAdditionalImageFile(null);
        setAdditionalImagePreview("");

        toast.success("Image added to product gallery");
      }
    } catch (error) {
      console.error("Failed to upload additional image:", error);
      toast.error("Failed to upload additional image");
    } finally {
      setUploadingAdditionalImage(false);
    }
  };

  // Remove image from product images array
  const handleRemoveImage = (imageUrl) => {
    // Create a copy of the current images array without the removed image
    const updatedImages = Array.isArray(product.images)
      ? product.images.filter((img) => img !== imageUrl)
      : [];

    // Update the product state
    setProduct({
      ...product,
      images: updatedImages,
    });

    toast.success("Image removed from product gallery");
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      // Validate fields - check for all required fields
      if (!product.name) {
        toast.error("Product name is required");
        setSaving(false);
        return;
      }

      if (!product.brand) {
        toast.error("Brand is required");
        setSaving(false);
        return;
      }

      if (!product.category) {
        toast.error("Category is required");
        setSaving(false);
        return;
      }

      if (!product.description) {
        toast.error("Description is required");
        setSaving(false);
        return;
      }

      // Create the product object with required fields
      const updatedProduct = {
        ...product,
        price: Number(product.price || 0),
        countInStock: Number(product.countInStock || 0),
      };

      // Handle image upload if there's a new image
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile, user.token);
          if (uploadResult && uploadResult.image) {
            // Set the main image
            updatedProduct.image = uploadResult.image;

            // IMPORTANT: Also add the image to the images array
            // First create a copy of the current images array or initialize an empty array
            const currentImages = Array.isArray(updatedProduct.images)
              ? [...updatedProduct.images]
              : [];

            // Add the new image to the images array if it's not already there
            if (!currentImages.includes(uploadResult.image)) {
              currentImages.push(uploadResult.image);
            }

            // Update the images array in the product
            updatedProduct.images = currentImages;

            console.log("Updated product with new image:", {
              mainImage: updatedProduct.image,
              imagesArray: updatedProduct.images,
            });
          }
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error(
            "Failed to upload image. Saving product with existing image."
          );
        }
      }

      // If no image is provided, use a placeholder
      if (!updatedProduct.image) {
        updatedProduct.image =
          "https://placehold.co/600x400?text=Product+Image";

        // Ensure the placeholder is also in the images array
        if (
          !Array.isArray(updatedProduct.images) ||
          updatedProduct.images.length === 0
        ) {
          updatedProduct.images = [
            "https://placehold.co/600x400?text=Product+Image",
          ];
        }
      }

      // Always ensure images array exists
      if (!Array.isArray(updatedProduct.images)) {
        updatedProduct.images = updatedProduct.image
          ? [updatedProduct.image]
          : [];
      }

      console.log("Saving product with data:", updatedProduct);

      if (id === "new") {
        // Create new product with all data in one request
        await createProduct(updatedProduct, user.token);
        toast.success("Product created successfully");
      } else {
        // Update existing product
        await updateProduct(updatedProduct, user.token);
        toast.success("Product updated successfully");
      }

      navigate("/admin/products");
    } catch (err) {
      console.error("Error saving product:", err);
      toast.error(err.message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-destructive mb-4">Error</h2>
        <p className="mb-6">{error}</p>
        <Button onClick={() => navigate("/admin/products")}>
          <FiArrowLeft className="mr-2 h-4 w-4" /> Back to Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">
          {id === "new" ? "Create Product" : "Edit Product"}
        </h1>
        <Button
          variant="outline"
          onClick={() => navigate("/admin/products")}
          className="flex items-center"
        >
          <FiArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column - Basic Info */}
          <div className="space-y-4">
            <FormGroup>
              <FormLabel htmlFor="name">Product Name*</FormLabel>
              <input
                type="text"
                id="name"
                name="name"
                value={product.name}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="price">Price* ($)</FormLabel>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                step="0.01"
                value={product.price}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="countInStock">Count in Stock*</FormLabel>
              <input
                type="number"
                id="countInStock"
                name="countInStock"
                min="0"
                value={product.countInStock}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="brand">Brand*</FormLabel>
              <input
                type="text"
                id="brand"
                name="brand"
                value={product.brand}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              />
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="category">Category*</FormLabel>
              {loadingCategories ? (
                <div className="flex items-center space-x-2 p-2 border border-input rounded-md">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                  <span className="text-sm text-muted-foreground">
                    Loading categories...
                  </span>
                </div>
              ) : categories.length > 0 ? (
                <select
                  id="category"
                  name="category"
                  value={product.category}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex flex-col space-y-2">
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    No categories found. You can type one or{" "}
                    <a
                      href="/admin/categories"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      add categories here
                    </a>
                    .
                  </p>
                </div>
              )}
            </FormGroup>
          </div>

          {/* Right Column - Images & Description */}
          <div className="space-y-4">
            <FormGroup>
              <FormLabel htmlFor="image">Main Product Image</FormLabel>
              <div className="mb-2">
                {(imagePreview || product.image) && (
                  <div className="relative mb-2">
                    <img
                      src={imagePreview || product.image}
                      alt={product.name}
                      className="h-32 w-32 object-cover rounded-md border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setImageFile(null);
                        setProduct({ ...product, image: "" });
                      }}
                      className="absolute -top-2 -right-2 rounded-full bg-background p-1 text-destructive hover:bg-destructive/10"
                    >
                      <FiXCircle className="h-4 w-4" />
                    </button>
                  </div>
                )}
                <div className="flex items-center">
                  <label
                    htmlFor="image-upload"
                    className="flex items-center justify-center rounded-md border border-dashed border-input bg-background p-4 text-sm text-muted-foreground hover:bg-secondary cursor-pointer"
                  >
                    <FiCamera className="mr-2 h-4 w-4" />
                    Upload Main Image
                  </label>
                  <input
                    type="file"
                    id="image-upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
              </div>
            </FormGroup>

            {/* Additional Product Images */}
            <FormGroup>
              <FormLabel>Additional Product Images</FormLabel>
              <div className="mb-4">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {Array.isArray(product.images) &&
                    product.images.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img}
                          alt={`Product image ${index + 1}`}
                          className="h-24 w-full object-cover rounded-md border border-border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(img)}
                          className="absolute -top-2 -right-2 rounded-full bg-background p-1 text-destructive hover:bg-destructive/10"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                </div>

                {/* Upload additional image */}
                <div className="flex items-center space-x-2">
                  {additionalImagePreview && (
                    <div className="relative">
                      <img
                        src={additionalImagePreview}
                        alt="Additional image preview"
                        className="h-24 w-24 object-cover rounded-md border border-border"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setAdditionalImagePreview("");
                          setAdditionalImageFile(null);
                        }}
                        className="absolute -top-2 -right-2 rounded-full bg-background p-1 text-destructive hover:bg-destructive/10"
                      >
                        <FiXCircle className="h-4 w-4" />
                      </button>
                    </div>
                  )}

                  <div className="flex items-center">
                    <label
                      htmlFor="additional-image-upload"
                      className="flex items-center justify-center rounded-md border border-dashed border-input bg-background p-4 text-sm text-muted-foreground hover:bg-secondary cursor-pointer"
                    >
                      <FiCamera className="mr-2 h-4 w-4" />
                      Select Image
                    </label>
                    <input
                      type="file"
                      id="additional-image-upload"
                      accept="image/*"
                      onChange={handleAdditionalImageChange}
                      className="hidden"
                    />
                  </div>

                  {additionalImageFile && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddAdditionalImage}
                      disabled={uploadingAdditionalImage}
                      className="flex items-center"
                    >
                      {uploadingAdditionalImage ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <FiPlus className="mr-2 h-4 w-4" />
                          Add to Gallery
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="description">Description*</FormLabel>
              <textarea
                id="description"
                name="description"
                rows="5"
                value={product.description}
                onChange={handleChange}
                className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                required
              ></textarea>
            </FormGroup>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="flex items-center" disabled={saving}>
            {saving ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <FiSave className="mr-2 h-4 w-4" />
                Save Product
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductEdit;
