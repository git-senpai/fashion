import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  FiArrowLeft,
  FiSave,
  FiCamera,
  FiXCircle,
  FiPlus,
  FiMinus,
  FiTrash2,
} from "react-icons/fi";
import {
  getProductDetails,
  updateProduct,
  createProduct,
} from "../../services/productService";
import categoryService from "../../services/categoryService";
import sizeService from "../../services/sizeService";
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
    sizeQuantities: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [sizes, setSizes] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSizes, setLoadingSizes] = useState(false);
  const [multipleImageFiles, setMultipleImageFiles] = useState([]);
  const [multipleImagePreviews, setMultipleImagePreviews] = useState([]);

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

  // Fetch sizes
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setLoadingSizes(true);
        const data = await sizeService.getSizes();
        setSizes(data);
      } catch (err) {
        console.error("Error fetching sizes:", err);
        toast.error("Failed to load sizes");
      } finally {
        setLoadingSizes(false);
      }
    };

    fetchSizes();
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
            sizeQuantities: [],
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

        // Ensure sizeQuantities is an array
        let sizeQtys = [];
        if (data.sizeQuantities && Array.isArray(data.sizeQuantities)) {
          sizeQtys = data.sizeQuantities;
        }

        setProduct({
          ...data,
          images: productImages,
          sizeQuantities: sizeQtys,
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

  // Handle multiple image uploads
  const handleMultipleImageUpload = (e) => {
    const newFiles = Array.from(e.target.files);
    if (newFiles.length === 0) return;
    
    // Store files for upload during form submission by adding to existing ones
    setMultipleImageFiles(prevFiles => [...prevFiles, ...newFiles]);
    
    // Create preview URLs for each new file and add to existing previews
    const newPreviewUrls = newFiles.map(file => URL.createObjectURL(file));
    setMultipleImagePreviews(prevPreviews => [...prevPreviews, ...newPreviewUrls]);
    
    // Reset the file input so the same files can be selected again if needed
    e.target.value = '';
    
    toast.success(`${newFiles.length} image${newFiles.length > 1 ? 's' : ''} selected`);
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

  // Add a size to the product
  const handleAddSize = (sizeId) => {
    if (!sizeId) return;
    
    const sizeName = sizes.find(size => size._id === sizeId)?.name;
    
    if (!sizeName) return;
    
    // Check if this size already exists
    const sizeExists = product.sizeQuantities.some(sq => sq.size === sizeName);
    
    if (sizeExists) {
      toast.error(`Size ${sizeName} is already added to this product`);
      return;
    }
    
    // Add the new size with zero quantity
    const updatedSizeQuantities = [
      ...product.sizeQuantities,
      { size: sizeName, quantity: 0 }
    ];
    
    setProduct({
      ...product,
      sizeQuantities: updatedSizeQuantities
    });
    
    toast.success(`Size ${sizeName} added to product`);
  };
  
  // Update quantity for a specific size
  const handleSizeQuantityChange = (sizeName, quantity) => {
    const numQuantity = parseInt(quantity) || 0;
    
    if (numQuantity < 0) {
      toast.error("Quantity cannot be negative");
      return;
    }
    
    const updatedSizeQuantities = product.sizeQuantities.map(sq => 
      sq.size === sizeName ? { ...sq, quantity: numQuantity } : sq
    );
    
    setProduct({
      ...product,
      sizeQuantities: updatedSizeQuantities
    });
  };
  
  // Remove a size from the product
  const handleRemoveSize = (sizeName) => {
    const updatedSizeQuantities = product.sizeQuantities.filter(
      sq => sq.size !== sizeName
    );
    
    setProduct({
      ...product,
      sizeQuantities: updatedSizeQuantities
    });
  };

  // Calculate total stock from size quantities
  const calculateTotalStock = () => {
    return product.sizeQuantities.reduce((total, sq) => total + Number(sq.quantity), 0);
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
      if (
        (!product.images || product.images.length === 0) && 
        !imageFile && 
        multipleImageFiles.length === 0
      ) {
        toast.error("At least one product image is required");
        setSaving(false);
        return;
      }
      
      // Validate that at least one size is added with stock
      if (!product.sizeQuantities || product.sizeQuantities.length === 0) {
        toast.error("At least one size with quantity must be added");
        setSaving(false);
        return;
      }
      
      // Validate that total stock is greater than zero
      const totalStock = calculateTotalStock();
      if (totalStock <= 0) {
        toast.error("Total inventory must be greater than zero");
        setSaving(false);
        return;
      }

      // Create the product object with required fields
      const updatedProduct = {
        ...product,
        price: Number(product.price || 0),
        countInStock: totalStock,
      };

      console.log("Product data before save:", updatedProduct);

      // Handle image uploads
      let uploadedImageUrls = [...(updatedProduct.images || [])];
      
      // Upload multiple images if present
      if (multipleImageFiles.length > 0) {
        toast.info(`Uploading ${multipleImageFiles.length} images...`);
        
        try {
          // Upload each image sequentially
          const uploadPromises = multipleImageFiles.map(async (imageFile) => {
            try {
              const uploadResult = await uploadImage(imageFile, user.token);
              if (uploadResult && uploadResult.image) {
                // Add the image to the images array if it's not already there
                if (!uploadedImageUrls.includes(uploadResult.image)) {
                  return uploadResult.image;
                }
              }
              return null;
            } catch (error) {
              console.error(`Error uploading image ${imageFile.name}:`, error);
              // Don't throw, just return null and continue with other images
              return null;
            }
          });
          
          // Wait for all uploads to complete
          const uploadedImages = await Promise.all(uploadPromises);
          
          // Filter out null results (failed uploads)
          const successfulUploads = uploadedImages.filter(img => img !== null);
          
          // Add successful uploads to the image URLs array
          uploadedImageUrls = [...uploadedImageUrls, ...successfulUploads];
          
          // Show success/failure message
          if (successfulUploads.length === multipleImageFiles.length) {
            toast.success(`All ${successfulUploads.length} images uploaded successfully`);
          } else {
            toast.warning(`Uploaded ${successfulUploads.length} out of ${multipleImageFiles.length} images`);
          }
        } catch (uploadError) {
          console.error("Error during image upload process:", uploadError);
          toast.error("Failed to upload some product images");
          setSaving(false);
          return;
        }
      }
      
      // Handle single image upload if present
      else if (imageFile) {
        try {
          const uploadResult = await uploadImage(imageFile, user.token);
          if (uploadResult && uploadResult.image) {
            // Add the image to the images array
            if (!uploadedImageUrls.includes(uploadResult.image)) {
              uploadedImageUrls.push(uploadResult.image);
            }
          }
        } catch (uploadError) {
          console.error("Error uploading image:", uploadError);
          toast.error("Failed to upload product image");
          setSaving(false);
          return;
        }
      }

      // Ensure images array is valid and update the product object
      updatedProduct.images = uploadedImageUrls.length > 0 ? uploadedImageUrls : [];

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
        toast.success("Product created successfully with size inventory");
      } else {
        // Update existing product
        console.log("Updating product with data:", updatedProduct);
        result = await updateProduct(updatedProduct, user.token);
        toast.success("Product updated successfully with size inventory");
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
              <FormLabel htmlFor="discountPercentage">Discount Percentage (%)</FormLabel>
              <div className="flex items-center">
                <input
                  type="number"
                  id="discountPercentage"
                  name="discountPercentage"
                  min="0"
                  max="100"
                  step="1"
                  value={product.discountPercentage || 0}
                  onChange={handleChange}
                  className="w-full rounded-md border border-input bg-background p-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <span className="ml-2 text-muted-foreground">%</span>
              </div>
              {product.discountPercentage > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-muted-foreground">
                    Final price: ${(product.price * (1 - product.discountPercentage / 100)).toFixed(2)}
                  </span>
                </div>
              )}
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

            <FormGroup>
              <FormLabel>Sizes & Inventory*</FormLabel>
              <div className="border border-input rounded-md p-4 space-y-4">
                <div className="flex flex-wrap gap-2 items-center">
                  <select
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    onChange={(e) => handleAddSize(e.target.value)}
                    value=""
                  >
                    <option value="">Add a size...</option>
                    {sizes
                      .filter(size => size.isActive !== false) // Only show active sizes
                      .filter(size => !product.sizeQuantities.some(sq => sq.size === size.name)) // Filter out already added sizes
                      .map((size) => (
                        <option key={size._id} value={size._id}>
                          {size.name}
                        </option>
                      ))}
                  </select>
                  {loadingSizes && (
                    <p className="text-sm text-muted-foreground">
                      Loading sizes...
                    </p>
                  )}
                  {sizes.length === 0 && !loadingSizes && (
                    <FormMessage>
                      No sizes found.{" "}
                      <a href="/admin/sizes" className="text-primary underline">
                        Create a size
                      </a>{" "}
                      first.
                    </FormMessage>
                  )}
                </div>

                {product.sizeQuantities.length > 0 ? (
                  <div className="space-y-2 mt-4">
                    <div className="grid grid-cols-12 gap-2 px-2 py-1 font-medium text-sm text-gray-500">
                      <div className="col-span-5">Size</div>
                      <div className="col-span-5 text-center">Stock Quantity</div>
                      <div className="col-span-2 text-right">Action</div>
                    </div>
                    
                    {product.sizeQuantities.map((sizeQty, index) => (
                      <div
                        key={index}
                        className="grid grid-cols-12 gap-2 items-center p-3 border border-input rounded-md bg-muted/20 hover:bg-muted/30 transition"
                      >
                        <div className="col-span-5 font-medium">{sizeQty.size}</div>
                        <div className="col-span-5">
                          <div className="flex items-center">
                            <button 
                              type="button"
                              onClick={() => {
                                const currentQty = parseInt(sizeQty.quantity) || 0;
                                if (currentQty > 0) {
                                  handleSizeQuantityChange(sizeQty.size, currentQty - 1);
                                }
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-l-md border border-input bg-muted hover:bg-muted/80"
                              disabled={parseInt(sizeQty.quantity) <= 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={sizeQty.quantity}
                              onChange={(e) => handleSizeQuantityChange(sizeQty.size, e.target.value)}
                              className="w-full h-8 border-y border-input px-2 text-center focus:outline-none focus:ring-1 focus:ring-ring"
                            />
                            <button 
                              type="button"
                              onClick={() => {
                                const currentQty = parseInt(sizeQty.quantity) || 0;
                                handleSizeQuantityChange(sizeQty.size, currentQty + 1);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded-r-md border border-input bg-muted hover:bg-muted/80"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <div className="col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveSize(sizeQty.size)}
                            className="text-destructive hover:text-destructive/80 p-1 rounded-full hover:bg-muted"
                            title="Remove size"
                          >
                            <FiTrash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="flex justify-between pt-3 mt-2 border-t border-input">
                      <span className="font-medium">Total Inventory:</span>
                      <span className="font-bold">{calculateTotalStock()}</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-muted/20 rounded-md mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      No sizes added yet. Please add at least one size with quantity.
                    </p>
                  </div>
                )}
              </div>
            </FormGroup>
          </div>

          {/* Right Column - Images & Description */}
          <div className="space-y-4">
            <FormGroup>
              <FormLabel>Product Images*</FormLabel>
              <div className="flex items-center justify-center flex-col">
                <label
                  htmlFor="image-upload"
                  className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer bg-background hover:bg-muted/50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <FiCamera className="w-8 h-8 mb-4 text-muted-foreground" />
                    <p className="mb-2 text-sm text-muted-foreground">
                      <span className="font-semibold">Click to upload</span>{" "}
                      or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or WEBP (Max: 5MB per image)
                    </p>
                  </div>
                  <input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleMultipleImageUpload}
                    className="hidden"
                    multiple
                  />
                </label>

                {/* Existing product images */}
                {product.images && product.images.length > 0 && (
                  <div className="mt-4 w-full">
                    <h3 className="text-sm font-medium mb-2">Current Images</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {product.images.map((imgUrl, index) => (
                        <div
                          key={`${imgUrl}-${index}`}
                          className="relative group overflow-hidden rounded-md border border-border bg-card"
                        >
                          <img
                            src={imgUrl}
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
                            onClick={() => handleRemoveImage(imgUrl)}
                            className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity duration-300 hover:bg-destructive/80 group-hover:opacity-100"
                          >
                            <FiXCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New images preview */}
                {multipleImagePreviews.length > 0 && (
                  <div className="mt-4 w-full">
                    <h3 className="text-sm font-medium mb-2">New Images to Upload</h3>
                    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
                      {multipleImagePreviews.map((previewUrl, index) => (
                        <div
                          key={`preview-${index}`}
                          className="relative group overflow-hidden rounded-md border border-border bg-card"
                        >
                          <img
                            src={previewUrl}
                            alt={`Product preview ${index + 1}`}
                            className="aspect-square h-full w-full object-cover transition-all duration-300 group-hover:scale-105"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/300x300?text=Image+Error";
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newPreviews = multipleImagePreviews.filter((_, i) => i !== index);
                              const newFiles = multipleImageFiles.filter((_, i) => i !== index);
                              setMultipleImagePreviews(newPreviews);
                              setMultipleImageFiles(newFiles);
                            }}
                            className="absolute right-2 top-2 rounded-full bg-destructive p-1 text-white opacity-0 transition-opacity duration-300 hover:bg-destructive/80 group-hover:opacity-100"
                          >
                            <FiXCircle className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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
