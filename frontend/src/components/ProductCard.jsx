import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
import { toast } from "sonner";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import { useWishlistStore } from "../store/useWishlistStore";

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [originalPrice, setOriginalPrice] = useState(0);
  const { addToCart } = useCartStore();
  const { user } = useAuth();
  const { addToWishlist, isInWishlist } = useWishlistStore();
  const [inWishlist, setInWishlist] = useState(false);

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

  // Generate random discount on component mount
  useEffect(() => {
    // Check if product is already in wishlist
    if (user && product?._id && isInWishlist) {
      setInWishlist(isInWishlist(product._id));
    }

    // Generate random discount between 5% and 25%
    const randomDiscount = Math.floor(Math.random() * 21) + 5;
    setDiscountPercentage(randomDiscount);

    // Calculate original price based on the discount
    const calculatedOriginalPrice =
      safeProduct.price / (1 - randomDiscount / 100);
    setOriginalPrice(calculatedOriginalPrice);
  }, [safeProduct.price, product, user, isInWishlist]);

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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (addingToCart) return;

    setAddingToCart(true);
    try {
      await addToCart(safeProduct);
      // Toast notification is handled inside the addToCart function
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

    if (!user) {
      toast.error("Please login to add items to your wishlist");
      return;
    }

    try {
      await addToWishlist(safeProduct);
      setInWishlist(true);
      // Toast notification is handled inside the addToWishlist function
    } catch (error) {
      console.error("Failed to add to wishlist:", error);
      toast.error(error.message || "Failed to add to wishlist");
    }
  };

  return (
    <motion.div
      className="group relative overflow-hidden rounded-lg border border-border bg-card"
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCurrentImageIndex(0);
      }}
    >
      {/* Product Image */}
      <Link to={`/products/${safeProduct._id}`} className="block">
        <div className="relative h-64 overflow-hidden">
          <img
            src={productImages[currentImageIndex]}
            alt={safeProduct.name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/600x400?text=No+Image";
            }}
          />

          {/* Discount Tag */}
          <div className="absolute left-0 top-0 bg-green-500 text-white px-2 py-1 text-xs font-bold shadow-md z-10">
            {discountPercentage}% OFF
          </div>

          {/* Image Navigation Dots */}
          {productImages.length > 1 && (
            <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  className={`h-1.5 w-6 rounded-full transition-colors ${
                    currentImageIndex === index
                      ? "bg-primary"
                      : "bg-gray-300 bg-opacity-60"
                  }`}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                />
              ))}
            </div>
          )}

          {/* Product Actions - Fixed z-index issue */}
          <div className="absolute right-2 top-2 flex flex-col gap-2 z-20">
            <button
              onClick={handleAddToWishlist}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg transform transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
              } ${
                inWishlist
                  ? "bg-[#e84a7f] text-white"
                  : "bg-white text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white"
              }`}
            >
              <FiHeart className="h-4 w-4 drop-shadow-sm" />
            </button>
            <button
              onClick={handleAddToCart}
              disabled={safeProduct.countInStock === 0 || addingToCart}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg transform transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
              } ${
                safeProduct.countInStock === 0 || addingToCart
                  ? "bg-white cursor-not-allowed opacity-50"
                  : "bg-white text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white"
              }`}
            >
              {addingToCart ? (
                <div className="h-3 w-3 animate-spin rounded-full border-2 border-[#e84a7f] border-t-transparent"></div>
              ) : (
                <FiShoppingCart className="h-4 w-4 drop-shadow-sm" />
              )}
            </button>
            <Link
              to={`/products/${safeProduct._id}`}
              className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg transform transition-all duration-300 ${
                isHovered ? "opacity-100 scale-100" : "opacity-0 scale-90"
              } bg-white text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white`}
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye className="h-4 w-4 drop-shadow-sm" />
            </Link>
          </div>
        </div>
      </Link>

      {/* Product Details */}
      <div className="p-4">
        <Link
          to={`/products/${safeProduct._id}`}
          className="text-md block font-medium hover:text-primary"
        >
          {safeProduct.name}
        </Link>
        <div className="mt-1 flex items-center">
          <div className="flex items-center">
            <div className="flex items-center">
              {[0, 1, 2, 3, 4].map((i) => (
                <svg
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(safeProduct.rating)
                      ? "text-yellow-400"
                      : "text-gray-300"
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
              <span className="ml-1 text-xs text-muted-foreground">
                ({safeProduct.numReviews})
              </span>
            </div>
          </div>
        </div>
        <div className="mt-2 flex flex-col">
          <div className="flex items-center gap-2">
            <p className="text-lg font-bold text-[#e84a7f]">
              ${safeProduct.price.toFixed(2)}
            </p>
            <p className="text-sm line-through text-muted-foreground">
              ${originalPrice.toFixed(2)}
            </p>
            <span className="text-xs font-medium text-green-600">
              Save {discountPercentage}%
            </span>
          </div>
          <div className="flex justify-between items-center mt-1">
            {safeProduct.countInStock === 0 ? (
              <span className="text-xs text-destructive">Out of Stock</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">
                In Stock
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
