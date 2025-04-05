import { useState } from "react";
import { Link } from "react-router-dom";
import { FiTrash, FiMove, FiShoppingCart } from "react-icons/fi";
import { motion } from "framer-motion";

const WishlistItem = ({
  product,
  onRemove,
  onAddToCart,
  onMove,
  hasCollections = false,
  activeCollection,
}) => {
  const [addingToCart, setAddingToCart] = useState(false);

  // Helper function to get the product image
  const getProductImage = (product) => {
    // If product has a single image property and it's not empty
    if (product.image) {
      return product.image;
    }

    // If product has an images array and it's not empty
    if (Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }

    // Fallback to placeholder
    return "https://placehold.co/400x400?text=No+Image";
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await onAddToCart(product);
    } finally {
      setAddingToCart(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
    >
      <Link to={`/products/${product._id}`}>
        <div className="h-56 overflow-hidden relative">
          <img
            src={getProductImage(product)}
            alt={product.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = "https://placehold.co/400x400?text=No+Image";
            }}
          />
        </div>
      </Link>
      <div className="p-4">
        <Link to={`/products/${product._id}`}>
          <h3 className="text-lg font-semibold text-gray-900 mb-1 hover:text-primary transition-colors duration-200">
            {product.name}
          </h3>
        </Link>
        <div className="flex items-center mb-2">
          <div className="flex">
            {[1, 2, 3, 4, 5].map((star) => (
              <svg
                key={star}
                className={`h-4 w-4 ${
                  star <= Math.floor(product.rating || 0)
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
          </div>
          <span className="text-xs text-gray-500 ml-1">
            ({product.numReviews || 0})
          </span>
        </div>
        <div className="flex justify-between items-center">
          <p className="text-xl font-bold text-gray-900">
            ${(product.price || 0).toFixed(2)}
          </p>
          <div className="flex space-x-2">
            <button
              onClick={() => onRemove(product._id)}
              className="p-2 text-gray-500 hover:text-red-600 rounded-full"
              aria-label="Remove from wishlist"
            >
              <FiTrash className="h-5 w-5" />
            </button>

            {hasCollections && (
              <button
                onClick={() => onMove(product, activeCollection)}
                className="p-2 text-gray-500 hover:text-blue-600 rounded-full"
                aria-label="Move to another collection"
              >
                <FiMove className="h-5 w-5" />
              </button>
            )}

            <button
              onClick={handleAddToCart}
              disabled={!product.countInStock || addingToCart}
              className={`p-2 rounded-full ${
                !product.countInStock
                  ? "text-gray-400 cursor-not-allowed"
                  : addingToCart
                  ? "text-gray-400"
                  : "text-gray-500 hover:text-primary"
              }`}
              aria-label="Add to cart"
            >
              {addingToCart ? (
                <div className="h-5 w-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
              ) : (
                <FiShoppingCart className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default WishlistItem;
