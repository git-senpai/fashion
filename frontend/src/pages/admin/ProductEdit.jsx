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
import categoryService from "../../services/categoryService";
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
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const data = await categoryService.getCategories();
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

        // Store user token in localStorage for productService to access
        if (user && user.token) {
          localStorage.setItem("user", JSON.stringify(user));
        }

        if (id === "new") {
          // For new products, just set default values and exit early
          setProduct({
            _id: "new",
            name: "",
            price: 0,
            brand: "",
            category: "",
            countInStock: 0,
            description: "",
            images: [],
          });
          setLoading(false);
          return;
        }

        const data = await getProductDetails(id);

        // Ensure images is an array
        let productImages = [];
        if (data.images && Array.isArray(data.images)) {
          productImages = data.images;
        } else if (data.image) {
          // If only single image exists, convert to array
          productImages = [data.image];
        }

        setProduct({
          ...data,
          images: productImages,
        });
      } catch (err) {
        setError(err.message || "Failed to load product details");
        toast.error("Failed to load product details");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

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

      // Store token in localStorage for productService to access
      if (user && user.token) {
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        toast.error("Authentication required. Please log in again.");
        navigate("/login?redirect=/admin/products");
        return;
      }

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

      // Check if product has at least one image
      if ((!product.images || product.images.length === 0) && !imageFile) {
        toast.error("At least one product image is required");
        setSaving(false);
        return;
      }

      // Create the product object with required fields
      const updatedProduct = {
        ...product,
        price: Number(product.price || 0),
        countInStock: Number(product.countInStock || 0),
      };

      console.log("Product data before save:", updatedProduct);

      // Handle image upload if there's a new image
      if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile, user.token);
          if (uploadResult && uploadResult.image) {
            // Add the image to the images array
            const currentImages = Array.isArray(updatedProduct.images)
              ? [...updatedProduct.images]
              : [];

            // Don't add duplicate images
            if (!currentImages.includes(uploadResult.image)) {
              currentImages.push(uploadResult.image);
            }

            updatedProduct.images = currentImages;
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload product image");
          setSaving(false);
          return;
        }
      }

      // Ensure images array is valid
      if (!Array.isArray(updatedProduct.images)) {
        updatedProduct.images = [];
      }

      // Make sure images array is not empty
      if (updatedProduct.images.length === 0) {
        toast.error("At least one product image is required");
        setSaving(false);
        return;
      }

      let result;
      if (id === "new") {
        // Create new product
        console.log("Creating new product with data:", updatedProduct);
        result = await createProduct(updatedProduct, user.token);
        toast.success("Product created successfully");
      } else {
        // Update existing product
        console.log("Updating product with data:", updatedProduct);
        result = await updateProduct(updatedProduct, user.token);
        toast.success("Product updated successfully");
      }

      // Redirect back to products list
      navigate("/admin/products");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
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
              <FormLabel htmlFor="category">Category</FormLabel>
              <select
                id="category"
                name="category"
                value={product.category}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="">Select a category</option>
                {categories &&
                  categories.map((category) => (
                    <option key={category._id} value={category.name}>
                      {category.name}
                    </option>
                  ))}
              </select>
              {loadingCategories && (
                <p className="text-sm text-muted-foreground">
                  Loading categories...
                </p>
              )}
              {categories.length === 0 && !loadingCategories && (
                <FormMessage>
                  No categories found.{" "}
                  <a
                    href="/admin/categories"
                    className="text-primary underline"
                  >
                    Create a category
                  </a>{" "}
                  first.
                </FormMessage>
              )}
            </FormGroup>
          </div>

          {/* Right Column - Images & Description */}
          <div className="space-y-4">
            <FormGroup>
              <FormLabel>Product Images</FormLabel>
              <div className="space-y-4">
                {/* Image preview section */}
                {product.images && product.images.length > 0 ? (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                    {product.images.map((imageUrl, index) => (
                      <div
                        key={`${imageUrl}-${index}`}
                        className="relative group overflow-hidden rounded-md border border-border bg-card"
                      >
                        <img
                          src={imageUrl}
                          alt={`Product image ${index + 1}`}
                          className="aspect-square h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src =
                              "https://placehold.co/300x300?text=Image+Error";
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(imageUrl)}
                          className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity duration-300 hover:bg-destructive/80 group-hover:opacity-100"
                        >
                          <FiXCircle className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex h-40 items-center justify-center rounded-md border-2 border-dashed border-input bg-background p-4 text-muted-foreground">
                    No images added yet
                  </div>
                )}

                {/* Upload new image section */}
                <div className="mt-4 space-y-4">
                  <div>
                    <input
                      type="file"
                      id="image"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("image").click()}
                      className="w-full"
                    >
                      <FiCamera className="mr-2 h-4 w-4" />
                      {imagePreview ? "Change Image" : "Upload Image"}
                    </Button>
                  </div>

                  {/* Image preview */}
                  {imagePreview && (
                    <div className="relative mt-4 overflow-hidden rounded-md border border-border">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="aspect-video w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview("");
                          setImageFile(null);
                        }}
                        className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/80"
                      >
                        <FiXCircle className="h-4 w-4" />
                      </button>
                    </div>
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
