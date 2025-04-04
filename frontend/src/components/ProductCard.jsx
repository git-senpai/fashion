import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiHeart, FiShoppingCart, FiEye, FiX } from "react-icons/fi";
import { toast } from "sonner";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import { useWishlistStore } from "../store/useWishlistStore";

export const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [addingToCart, setAddingToCart] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const sizeSelectorRef = useRef(null);
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

  // Check if product has size options
  const hasSizes = safeProduct.sizeQuantities && safeProduct.sizeQuantities.length > 0;

  // Use product's discount percentage
  useEffect(() => {
    // Check if product is already in wishlist
    if (user && product?._id && isInWishlist) {
      setInWishlist(isInWishlist(product._id));
    }

    // Get discount percentage from product or default to 0
    const discount = product?.discountPercentage || 0;
    setDiscountPercentage(discount);
  }, [safeProduct.price, product, user, isInWishlist]);

  // Close size selector when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sizeSelectorRef.current && !sizeSelectorRef.current.contains(event.target)) {
        setShowSizeSelector(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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

    // Check if the product has sizes
    if (hasSizes) {
      // Show size selector instead of immediately adding to cart
      setShowSizeSelector(true);
      return;
    }

    // If no sizes, add to cart directly
    await addItemToCart();
  };

  const addItemToCart = async (size = null) => {
    setAddingToCart(true);
    try {
      // Create cart item with the selected size if available
      const cartItem = {
        productId: safeProduct._id,
        name: safeProduct.name,
        image: productImages[0],
        price: safeProduct.price,
        countInStock: safeProduct.countInStock,
        quantity: selectedQuantity,
        size: size,
      };

      await addToCart(cartItem);
      // Toast notification is handled inside the addToCart function
      
      // Reset states
      setShowSizeSelector(false);
      setSelectedSize("");
      setSelectedQuantity(1);
    } catch (error) {
      console.error("Failed to add to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleSizeSelection = async (size) => {
    if (!size) return;
    
    // Find the selected size info
    const sizeInfo = safeProduct.sizeQuantities.find(sq => sq.size === size);
    
    // Check if the size is available
    if (!sizeInfo || sizeInfo.quantity <= 0) {
      toast.error(`Size ${size} is out of stock`);
      return;
    }
    
    setSelectedSize(size);
    await addItemToCart(size);
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

  // Calculate original price and savings if there's a discount
  const calculateOriginalPrice = () => {
    if (discountPercentage > 0) {
      return safeProduct.price / (1 - discountPercentage / 100);
    }
    return safeProduct.price;
  };

  const calculateSavings = () => {
    if (discountPercentage > 0) {
      const originalPrice = calculateOriginalPrice();
      return originalPrice - safeProduct.price;
    }
    return 0;
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
          {discountPercentage > 0 && (
            <div className="absolute left-0 top-0 bg-green-500 text-white px-2 py-1 text-xs font-bold shadow-md z-10">
              {discountPercentage}% OFF
            </div>
          )}

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

          {/* Product Actions */}
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
          
          {/* Size Selector Modal */}
          {showSizeSelector && hasSizes && (
            <div 
              className="absolute inset-0 bg-black/70 flex items-center justify-center z-30"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <div 
                ref={sizeSelectorRef}
                className="bg-white rounded-lg p-4 max-w-xs w-full mx-4"
              >
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-sm">Select a Size</h3>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowSizeSelector(false);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <FiX size={18} />
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  {safeProduct.sizeQuantities
                    .filter(sq => sq.quantity > 0)
                    .map((sizeQty) => (
                      <button
                        key={sizeQty.size}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleSizeSelection(sizeQty.size);
                        }}
                        className="min-w-[40px] h-8 px-2 border border-gray-300 rounded-md text-sm hover:border-[#e84a7f] hover:bg-[#e84a7f]/10 transition-colors"
                      >
                        {sizeQty.size}
                      </button>
                    ))}
                </div>
                
                {safeProduct.sizeQuantities.filter(sq => sq.quantity > 0).length === 0 && (
                  <p className="text-sm text-red-500 mb-4">All sizes are out of stock</p>
                )}
              </div>
            </div>
          )}
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
            {discountPercentage > 0 ? (
              <>
                <p className="text-lg font-bold text-[#e84a7f]">
                  ${safeProduct.price.toFixed(2)}
                </p>
                <p className="text-sm line-through text-muted-foreground">
                  ${calculateOriginalPrice().toFixed(2)}
                </p>
                <span className="text-xs font-medium text-green-600 bg-green-100 px-1 py-0.5 rounded">
                  -{discountPercentage}%
                </span>
              </>
            ) : (
              <p className="text-lg font-bold text-[#e84a7f]">
                ${safeProduct.price.toFixed(2)}
              </p>
            )}
          </div>
          <div className="flex justify-between items-center mt-1">
            {safeProduct.countInStock === 0 ? (
              <span className="text-xs text-destructive">Out of Stock</span>
            ) : (
              <span className="text-xs text-green-600 font-medium">
                In Stock
              </span>
            )}
            {discountPercentage > 0 && (
              <span className="text-xs text-gray-500">
                Save ${calculateSavings().toFixed(2)}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};