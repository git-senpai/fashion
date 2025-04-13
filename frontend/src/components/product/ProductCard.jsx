import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  FiHeart,
  FiShoppingCart,
  FiEye,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../hooks/useAuth";
import WishlistModal from "./WishlistModal";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showWishlistModal, setShowWishlistModal] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);
  const [slideDirection, setSlideDirection] = useState("right");
  const intervalRef = useRef(null);
  const carouselRef = useRef(null);

  const { addToCart } = useCartStore();
  const { user, isAuthenticated } = useAuth();
  const {
    addToWishlist,
    isInWishlist,
    collections,
    createCollection,
    removeFromWishlist,
  } = useWishlistStore();

  // Make sure product has default values for required properties
  const safeProduct = {
    _id: product?._id || "not-found",
    name: product?.name || "Product Name",
    price: product?.price || 0,
    rating: product?.rating || 0,
    numReviews: product?.numReviews || 0,
    countInStock: product?.countInStock || 0,
    image: product?.image || "https://placehold.co/600x400?text=No+Image",
    ...product,
  };

  // Check if the product is in the wishlist
  const productInWishlist = isInWishlist?.(safeProduct._id) || false;

  // Handle different image formats - single image or images array
  const productImages = (() => {
    // If product has an images array and it's not empty
    if (Array.isArray(safeProduct.images) && safeProduct.images.length > 0) {
      return safeProduct.images;
    }
    // If product has a single image property
    else if (safeProduct.image) {
      return [safeProduct.image];
    }
    // Fallback to placeholder
    else {
      return ["https://placehold.co/600x400?text=No+Image"];
    }
  })();

  // Update the auto-scrolling carousel effect
  useEffect(() => {
    // Only auto-scroll if we have multiple images and not hovering
    if (productImages.length > 1 && !isHovered) {
      intervalRef.current = setInterval(() => {
        setSlideDirection("right");
        setCurrentImageIndex((prevIndex) =>
          prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
        );
      }, 3000); // Change image every 3 seconds (slower than before)
    }

    return () => {
      // Clean up interval when component unmounts or dependencies change
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isHovered, productImages.length]);

  // Navigation handlers for manual image browsing
  const goToNextImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSlideDirection("right");
    setCurrentImageIndex((prevIndex) =>
      prevIndex === productImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevImage = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSlideDirection("left");
    setCurrentImageIndex((prevIndex) =>
      prevIndex === 0 ? productImages.length - 1 : prevIndex - 1
    );
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (safeProduct.countInStock <= 0) {
      toast.error("This product is out of stock");
      return;
    }

    if (addingToCart) return;

    // If the product has sizes, redirect to product detail page
    if (safeProduct.sizeQuantities && safeProduct.sizeQuantities.length > 0) {
      // Navigate to product detail page to select size
      window.location.href = `/products/${safeProduct._id}`;
      return;
    }

    // Add to cart directly if no sizes
    setAddingToCart(true);
    try {
      const cartItem = {
        productId: safeProduct._id,
        name: safeProduct.name,
        image: productImages[0],
        price: safeProduct.price,
        countInStock: safeProduct.countInStock,
        quantity: 1,
      };

      await addToCart(cartItem);
      toast.success(`${safeProduct.name} added to cart`);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    // If product is already in wishlist, remove it
    if (productInWishlist) {
      setAddingToWishlist(true);
      try {
        await removeFromWishlist(safeProduct._id);
        toast.success(`${safeProduct.name} removed from wishlist`);
      } catch (error) {
        console.error("Failed to remove from wishlist:", error);
        toast.error(error.message || "Failed to remove from wishlist");
      } finally {
        setAddingToWishlist(false);
      }
      return;
    }

    // If there are collections, show the modal
    if (collections && collections.length > 0) {
      setShowWishlistModal(true);
    } else {
      // No collections, add directly to main wishlist
      addToMainWishlist();
    }
  };

  const addToMainWishlist = async () => {
    setShowWishlistModal(false);
    setAddingToWishlist(true);
    try {
      await addToWishlist(safeProduct);
      toast.success(`${safeProduct.name} added to wishlist`);
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error(error.message || "Failed to add to wishlist");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const addToCollection = async (collectionId) => {
    setShowWishlistModal(false);
    setAddingToWishlist(true);
    try {
      await addToWishlist(safeProduct, collectionId);
      toast.success(`${safeProduct.name} added to collection`);
    } catch (error) {
      console.error("Failed to add to collection:", error);
      toast.error(error.message || "Failed to add to collection");
    } finally {
      setAddingToWishlist(false);
    }
  };

  const handleCreateCollection = async (name) => {
    const newCollections = await createCollection(name);

    // If we have the new collection, add the product to it
    if (newCollections && newCollections.length > 0) {
      const newCollection = newCollections[newCollections.length - 1];
      addToCollection(newCollection._id);
    }
  };

  // Helper functions for price calculations
  const calculatePrices = () => {
    let finalPrice = safeProduct.price || 0;
    let originalPrice = safeProduct.originalPrice;
    let discountPercentage = safeProduct.discountPercentage;
    let calculatedDiscount = 0;

    // If we have original price but no discount percentage, calculate it
    if (originalPrice && originalPrice > finalPrice && !discountPercentage) {
      calculatedDiscount = Math.round(
        ((originalPrice - finalPrice) / originalPrice) * 100
      );
      discountPercentage = calculatedDiscount;
    }
    // If we have discount but no original price, calculate it
    else if (!originalPrice && discountPercentage > 0) {
      originalPrice =
        Math.round((finalPrice / (1 - discountPercentage / 100)) * 100) / 100;
    }

    // Calculate savings amount
    const savingsAmount =
      originalPrice && discountPercentage > 0 ? originalPrice - finalPrice : 0;

    return {
      finalPrice,
      originalPrice,
      discountPercentage,
      savingsAmount,
    };
  };

  const priceInfo = calculatePrices();

  return (
    <>
      <Link
        to={`/products/${safeProduct._id}`}
        className="group relative flex flex-col overflow-hidden rounded-xl border border-gray-100 bg-white transition-all duration-300 hover:border-primary/20 hover:shadow-lg"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image Carousel */}
        <div
          className="relative h-[320px] w-full overflow-hidden bg-gray-50"
          ref={carouselRef}
        >
          {/* Carousel Navigation (only visible when multiple images and hovering) */}
          {productImages.length > 1 && (
            <>
              <button
                onClick={goToPrevImage}
                className={`absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-md transition-all hover:bg-white ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Previous image"
              >
                <FiChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={goToNextImage}
                className={`absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/80 p-1.5 text-gray-800 shadow-md transition-all hover:bg-white ${
                  isHovered ? "opacity-100" : "opacity-0"
                }`}
                aria-label="Next image"
              >
                <FiChevronRight className="h-4 w-4" />
              </button>

              {/* Image Indicators */}
              <div
                className={`absolute bottom-2 left-0 right-0 z-10 flex justify-center gap-1 transition-opacity ${
                  isHovered ? "opacity-100" : "opacity-100"
                }`}
              >
                {productImages.map((_, index) => (
                  <span
                    key={index}
                    className={`h-1.5 w-1.5 rounded-full ${
                      currentImageIndex === index ? "bg-white" : "bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </>
          )}

          {/* Current Image with Smooth Transitions */}
          <div className="relative h-full w-full overflow-hidden">
            <motion.div
              className="absolute h-full w-full"
              initial={{ x: slideDirection === "right" ? "100%" : "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: slideDirection === "right" ? "-100%" : "100%" }}
              transition={{
                type: "tween",
                duration: 0.4,
                ease: "easeInOut",
              }}
              key={currentImageIndex}
            >
              <img
                src={productImages[currentImageIndex]}
                alt={safeProduct.name}
                className="h-full w-full object-cover object-center"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "https://placehold.co/600x400?text=Image+Not+Found";
                }}
              />
            </motion.div>
          </div>

          {/* Hover Overlay with Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

          {/* Discount Tag - More prominent */}
          {priceInfo.discountPercentage > 0 && (
            <div className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-bold text-white shadow-md">
              -{priceInfo.discountPercentage}%
            </div>
          )}

          {/* Out of Stock Tag */}
          {safeProduct.countInStock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
              <span className="rounded-full bg-black/70 px-4 py-1.5 text-sm font-medium text-white">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div
            className={`absolute bottom-3 right-3 flex flex-col gap-2 transition-all duration-300 ${
              isHovered
                ? "translate-x-0 opacity-100"
                : "translate-x-10 opacity-0"
            }`}
          >
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              className="rounded-full bg-white p-2.5 shadow-md transition-colors hover:bg-primary cursor-pointer"
              aria-label={
                productInWishlist ? "Remove from wishlist" : "Add to wishlist"
              }
            >
              <FiHeart
                className={`h-5 w-5 ${
                  productInWishlist ? "fill-red-500 text-red-500" : ""
                }`}
              />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={safeProduct.countInStock <= 0 || addingToCart}
              className={`rounded-full bg-white p-2.5 shadow-md transition-colors hover:bg-primary cursor-pointer ${
                safeProduct.countInStock <= 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              aria-label="Add to cart"
            >
              {addingToCart ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <FiShoppingCart className="h-5 w-5" />
              )}
            </button>
            <Link
              to={`/products/${safeProduct._id}`}
              className="rounded-full bg-white p-2.5 shadow-md transition-colors hover:bg-primary"
              aria-label="View product details"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col justify-between p-4">
          {/* Brand */}
          {safeProduct.brand && (
            <span className="mb-1 text-xs font-medium uppercase text-gray-500">
              {safeProduct.brand}
            </span>
          )}

          {/* Product Name */}
          <h3 className="mb-1 line-clamp-2 text-sm font-medium text-gray-800 group-hover:text-primary">
            {safeProduct.name}
          </h3>

          {/* Rating */}
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex">
              {Array.from({ length: 5 }).map((_, index) => (
                <svg
                  key={index}
                  className={`h-3.5 w-3.5 ${
                    index < Math.round(safeProduct.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            {safeProduct.numReviews > 0 && (
              <span className="text-xs text-gray-500">
                ({safeProduct.numReviews})
              </span>
            )}
          </div>

          {/* Price Section - Enhanced with clear discount visualization */}
          <div className="mt-auto space-y-1">
            {/* Price Display with Original Price */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Discounted price (current price) */}
              <span className="text-base font-bold text-primary">
                ${priceInfo.finalPrice.toFixed(2)}
              </span>

              {/* Original price with strikethrough */}
              {priceInfo.discountPercentage > 0 && priceInfo.originalPrice && (
                <span className="text-xs text-gray-500 line-through">
                  ${priceInfo.originalPrice.toFixed(2)}
                </span>
              )}

              {/* Savings amount when there's a discount */}
              {priceInfo.savingsAmount > 0 && (
                <span className="ml-auto text-xs text-green-600 font-medium">
                  Save ${priceInfo.savingsAmount.toFixed(2)}
                </span>
              )}
            </div>

            {/* Show discount percentage as text when applicable */}
            {priceInfo.discountPercentage > 0 && (
              <div className="flex items-center">
                <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded-sm font-medium">
                  {priceInfo.discountPercentage}% OFF
                </span>
              </div>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Modal */}
      {showWishlistModal && (
        <WishlistModal
          isOpen={showWishlistModal}
          onClose={() => setShowWishlistModal(false)}
          collections={collections || []}
          onAddToDefault={addToMainWishlist}
          onAddToCollection={addToCollection}
          onCreateCollection={handleCreateCollection}
          product={safeProduct}
        />
      )}
    </>
  );
};

export default ProductCard;
