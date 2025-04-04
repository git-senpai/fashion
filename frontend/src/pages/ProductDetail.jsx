import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiHeart,
  FiStar,
  FiChevronRight,
  FiChevronLeft,
} from "react-icons/fi";
import { motion } from "framer-motion";
import {
  getProductDetails,
  createProductReview,
} from "../services/productService";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormGroup, FormLabel, FormMessage } from "../components/ui/Form";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart } = useCartStore();
  const { addToWishlist, removeFromWishlist, isInWishlist } =
    useWishlistStore();
  const { user, isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [currentImage, setCurrentImage] = useState(0);
  const [reviewForm, setReviewForm] = useState({
    rating: 5,
    comment: "",
  });
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [addingToCart, setAddingToCart] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const navigate = useNavigate();

  // Check if the product is in the wishlist
  const productInWishlist = product ? isInWishlist(product._id) : false;

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        console.log("Fetching product with ID:", id);
        const data = await getProductDetails(id);
        console.log("Product data received:", data);
        setProduct(data);

        // Generate random discount between 5% and 25%
        const randomDiscount = Math.floor(Math.random() * 21) + 5;
        setDiscountPercentage(randomDiscount);

        // Calculate original price based on the discount
        if (data && data.price) {
          const calculatedOriginalPrice =
            data.price / (1 - randomDiscount / 100);
          setOriginalPrice(calculatedOriginalPrice);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    try {
      if (product.countInStock === 0) {
        toast.error("This product is out of stock");
        return;
      }

      if (product.sizeQuantities && product.sizeQuantities.length > 0 && !selectedSize) {
        toast.error("Please select a size");
        return;
      }
      
      // Check if the selected size has enough stock
      if (selectedSize) {
        const sizeInfo = product.sizeQuantities.find(sq => sq.size === selectedSize);
        if (!sizeInfo) {
          toast.error("Selected size not found");
          return;
        }
        
        if (sizeInfo.quantity < quantity) {
          toast.error(`Only ${sizeInfo.quantity} items available for size ${selectedSize}`);
          return;
        }
      }

      setAddingToCart(true);

      // Create cart item object
      const cartItem = {
        productId: product._id,
        name: product.name,
        image: productImages[0],
        price: product.price,
        countInStock: product.countInStock,
        quantity,
        size: selectedSize || null,
      };

      await addToCart(cartItem);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      navigate("/login?redirect=products/" + id);
      return;
    }

    setAddingToWishlist(true);
    try {
      if (productInWishlist) {
        await removeFromWishlist(product._id);
        // Toast notification is handled inside removeFromWishlist function
      } else {
        await addToWishlist(product);
        // Toast notification is handled inside addToWishlist function
      }
    } catch (error) {
      console.error("Failed to update wishlist:", error);
      toast.error(error.message || "Failed to update wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.countInStock || 1)) {
      setQuantity(value);
    }
  };

  const handleReviewChange = (e) => {
    const { name, value } = e.target;
    setReviewForm({
      ...reviewForm,
      [name]: name === "rating" ? parseInt(value) : value,
    });
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.comment.trim()) {
      setReviewError("Please enter a comment");
      return;
    }

    try {
      setReviewSubmitting(true);
      setReviewError("");

      if (!user) {
        toast.error("You must be logged in to submit a review");
        return;
      }

      await createProductReview(id, reviewForm, user.token);
      toast.success("Review submitted successfully");

      // Refetch product to get updated reviews
      const updatedProduct = await getProductDetails(id);
      setProduct(updatedProduct);

      // Reset form
      setReviewForm({
        rating: 5,
        comment: "",
      });
    } catch (error) {
      console.error("Error submitting review:", error);
      setReviewError(
        error.message || "Failed to submit review. Please try again."
      );
      toast.error(error.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const nextImage = () => {
    if (productImages.length > 1) {
      setCurrentImage((prev) =>
        prev === productImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setCurrentImage((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    }
  };

  // Prepare image list
  const productImages = (() => {
    if (!product) return [];

    // If product has an images array and it's not empty
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images;
    }
    // If product has a single image property
    else if (product.image) {
      return [product.image];
    }
    // Fallback to placeholder
    else {
      return ["https://placehold.co/600x400?text=No+Image"];
    }
  })();

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div>
            <Skeleton height={400} className="mb-4 rounded-lg" />
            <div className="grid grid-cols-4 gap-2">
              {Array(4)
                .fill()
                .map((_, index) => (
                  <Skeleton key={index} height={80} className="rounded-md" />
                ))}
            </div>
          </div>
          <div>
            <Skeleton height={36} width={300} className="mb-2" />
            <Skeleton height={24} width={150} className="mb-4" />
            <Skeleton height={24} width={100} className="mb-4" />
            <Skeleton height={100} className="mb-4" />
            <Skeleton height={50} width={200} className="mb-4" />
            <Skeleton height={50} width={150} />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center px-4 py-8 text-center">
        <h1 className="mb-4 text-2xl font-bold">Product Not Found</h1>
        <p className="mb-6 text-muted-foreground">
          The product you are looking for might have been removed or is
          temporarily unavailable.
        </p>
        <Link
          to="/products"
          className="rounded-md bg-primary px-4 py-2 text-white"
        >
          Return to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumbs */}
      <div className="mb-6 flex items-center text-sm text-muted-foreground">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <FiChevronRight className="mx-2 h-4 w-4" />
        <Link to="/products" className="hover:text-primary">
          Products
        </Link>
        <FiChevronRight className="mx-2 h-4 w-4" />
        <span>{product.category}</span>
        <FiChevronRight className="mx-2 h-4 w-4" />
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div>
          <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100">
            <img
              src={
                productImages[currentImage] ||
                "https://placehold.co/600x400?text=No+Image"
              }
              alt={product.name}
              className="h-[400px] w-full object-cover object-center"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src =
                  "https://placehold.co/600x400?text=Image+Not+Found";
              }}
            />

            {/* Discount Tag */}
            <div className="absolute left-0 top-0 bg-green-500 text-white px-2 py-1 text-xs font-bold shadow-md z-10">
              {discountPercentage}% OFF
            </div>

            {productImages.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white"
                >
                  <FiChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white"
                >
                  <FiChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnail Images */}
          {productImages.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`overflow-hidden rounded-md border-2 ${
                    currentImage === index
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-20 w-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src =
                        "https://placehold.co/300x200?text=Thumbnail";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div>
          <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>

          {/* Rating */}
          <div className="mb-4 flex items-center">
            <div className="flex items-center">
              {Array(5)
                .fill()
                .map((_, index) => (
                  <FiStar
                    key={index}
                    className={`h-4 w-4 ${
                      index < Math.round(product.rating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-gray-300"
                    }`}
                  />
                ))}
            </div>
            <span className="ml-2 text-sm text-muted-foreground">
              {product.rating.toFixed(1)} ({product.numReviews} reviews)
            </span>
          </div>

          {/* Price */}
          <div className="mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-[#e84a7f]">
                ${product.price.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${originalPrice.toFixed(2)}
              </span>
              <span className="text-sm font-medium text-green-600">
                Save {discountPercentage}%
              </span>
            </div>
          </div>

          {/* Stock Status */}
          <div className="mb-6">
            <span
              className={`text-sm font-medium ${
                product.countInStock > 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {product.countInStock > 0
                ? `In Stock (${product.countInStock} available)`
                : "Out of Stock"}
            </span>
          </div>
          
          {/* Size Selection */}
          {product.sizeQuantities && product.sizeQuantities.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 text-sm font-medium">Select Size</h3>
              <div className="flex flex-wrap gap-2">
                {product.sizeQuantities.map((sizeQty) => (
                  <button
                    key={sizeQty.size}
                    type="button"
                    onClick={() => setSelectedSize(sizeQty.size)}
                    disabled={sizeQty.quantity === 0}
                    className={`flex h-10 min-w-[3rem] items-center justify-center rounded-md border px-3 transition-colors ${
                      selectedSize === sizeQty.size
                        ? "border-primary bg-primary/10 font-medium text-primary"
                        : sizeQty.quantity === 0
                        ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {sizeQty.size}
                    {sizeQty.quantity === 0 && <span className="ml-1">(Out of stock)</span>}
                  </button>
                ))}
              </div>
              {selectedSize && (
                <p className="mt-2 text-sm text-muted-foreground">
                  {product.sizeQuantities.find(sq => sq.size === selectedSize)?.quantity || 0} items available in size {selectedSize}
                </p>
              )}
            </div>
          )}

          {/* Add to Cart */}
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <div className="w-24">
              <Input
                type="number"
                value={quantity}
                onChange={handleQuantityChange}
                min={1}
                max={product.countInStock}
                disabled={product.countInStock === 0}
              />
            </div>
            <Button
              onClick={handleAddToCart}
              disabled={product.countInStock === 0 || addingToCart}
              className="flex items-center gap-2"
            >
              {addingToCart ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Adding...
                </>
              ) : (
                <>
                  <FiShoppingCart className="h-4 w-4" />
                  Add to Cart
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={handleWishlistToggle}
              disabled={addingToWishlist}
            >
              {addingToWishlist ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
                  Updating...
                </>
              ) : (
                <>
                  <FiHeart
                    className={`h-4 w-4 ${
                      productInWishlist ? "fill-red-500 text-red-500" : ""
                    }`}
                  />
                  {productInWishlist
                    ? "Remove from Wishlist"
                    : "Add to Wishlist"}
                </>
              )}
            </Button>
          </div>

          {/* Product Details Tabs */}
          <div className="mb-4 border-b border-border">
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab("description")}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  activeTab === "description"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Description
              </button>
              <button
                onClick={() => setActiveTab("specifications")}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  activeTab === "specifications"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Specifications
              </button>
              <button
                onClick={() => setActiveTab("reviews")}
                className={`border-b-2 pb-2 text-sm font-medium ${
                  activeTab === "reviews"
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground"
                }`}
              >
                Reviews ({product.numReviews})
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="pb-6">
            {activeTab === "description" && (
              <div className="prose max-w-none text-sm">
                <p>{product.description}</p>
              </div>
            )}

            {activeTab === "specifications" && (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm">
                  <span className="font-medium">Brand</span>
                  <span>{product.brand}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm">
                  <span className="font-medium">Category</span>
                  <span>{product.category}</span>
                </div>
                
                {/* Display available sizes and their stock */}
                {product.sizeQuantities && product.sizeQuantities.length > 0 && (
                  <div className="rounded-md bg-muted p-3">
                    <span className="block font-medium mb-2">Available Sizes</span>
                    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                      {product.sizeQuantities
                        .filter(sq => sq.quantity > 0)
                        .map(sq => (
                          <div key={sq.size} className="text-center rounded bg-white p-1.5 border border-gray-200">
                            <span className="block font-medium">{sq.size}</span>
                            <span className="text-xs text-muted-foreground">
                              {sq.quantity} in stock
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
                
                {product.specifications?.map((spec, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm"
                  >
                    <span className="font-medium">{spec.name}</span>
                    <span>{spec.value}</span>
                  </div>
                ))}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-6">
                {/* Review Form */}
                {isAuthenticated ? (
                  <div className="mb-6 rounded-lg border border-border p-4">
                    <h3 className="mb-4 text-lg font-semibold">
                      Write a Review
                    </h3>
                    <form onSubmit={handleReviewSubmit}>
                      <FormGroup>
                        <FormLabel>Rating</FormLabel>
                        <div className="flex items-center space-x-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() =>
                                setReviewForm({ ...reviewForm, rating: star })
                              }
                              className="p-1"
                            >
                              <FiStar
                                className={`h-5 w-5 ${
                                  star <= reviewForm.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </FormGroup>
                      <FormGroup>
                        <FormLabel>Your Review</FormLabel>
                        <textarea
                          name="comment"
                          value={reviewForm.comment}
                          onChange={handleReviewChange}
                          rows={4}
                          className="w-full rounded-md border border-input bg-background p-2 text-sm"
                        />
                        {reviewError && (
                          <FormMessage>{reviewError}</FormMessage>
                        )}
                      </FormGroup>
                      <Button type="submit" disabled={reviewSubmitting}>
                        {reviewSubmitting ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  </div>
                ) : (
                  <div className="mb-6 rounded-lg border border-border p-4 text-center">
                    <p className="mb-2 text-muted-foreground">
                      Please sign in to write a review
                    </p>
                    <Link to="/login" className="text-primary hover:underline">
                      Sign In
                    </Link>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Customer Reviews</h3>

                  {product.reviews && product.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {product.reviews.map((review) => (
                        <div
                          key={review._id}
                          className="rounded-lg border border-border p-4"
                        >
                          <div className="mb-2 flex items-center justify-between">
                            <div className="flex items-center">
                              <div className="mr-3 h-8 w-8 rounded-full bg-muted text-center leading-8">
                                {review.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium">{review.name}</p>
                                <div className="flex items-center">
                                  {Array(5)
                                    .fill()
                                    .map((_, index) => (
                                      <FiStar
                                        key={index}
                                        className={`h-3 w-3 ${
                                          index < review.rating
                                            ? "fill-yellow-400 text-yellow-400"
                                            : "text-gray-300"
                                        }`}
                                      />
                                    ))}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-sm">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground">No reviews yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
