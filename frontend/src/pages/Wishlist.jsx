import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiTrash,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import { toast } from "sonner";

const Wishlist = () => {
  const {
    wishlistItems,
    loading,
    error,
    removeFromWishlist,
    clearWishlist,
    initWishlist,
  } = useWishlistStore();
  const { addToCart } = useCartStore();
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [addingToCart, setAddingToCart] = useState({});

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=wishlist");
    } else {
      initWishlist();
    }
  }, [isAuthenticated, navigate, initWishlist]);

  const handleAddToCart = async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
    try {
      await addToCart(product, 1);
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      await removeFromWishlist(productId);
    } catch (error) {
      toast.error(error.message || "Failed to remove from wishlist");
    }
  };

  const handleClearWishlist = async () => {
    if (
      window.confirm("Are you sure you want to clear your entire wishlist?")
    ) {
      try {
        await clearWishlist();
        toast.success("Wishlist has been cleared");
      } catch (error) {
        toast.error(error.message || "Failed to clear wishlist");
      }
    }
  };

  const handleRetry = () => {
    initWishlist();
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your wishlist...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-red-500 mb-4 text-xl">
            <FiRefreshCw className="inline-block mr-2 h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Error Loading Wishlist
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
            >
              Try Again
            </button>
            <Link
              to="/products"
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors duration-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh]"
        >
          <svg
            className="w-24 h-24 text-gray-300 mb-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your wishlist yet.
          </p>
          <Link
            to="/products"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center gap-2"
          >
            <FiArrowLeft /> Discover Products
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">
          My Wishlist ({wishlistItems.length} items)
        </h1>
        <button
          onClick={handleClearWishlist}
          className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200"
        >
          Clear All
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
          >
            <Link to={`/products/${product._id}`}>
              <div className="h-56 overflow-hidden relative">
                <img
                  src={product.image}
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
                        star <= Math.floor(product.rating)
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
                  ({product.numReviews})
                </span>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-xl font-bold text-gray-900">
                  ${product.price?.toFixed(2)}
                </p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="p-2 text-gray-500 hover:text-red-600 rounded-full"
                  >
                    <FiTrash className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      !product.countInStock || addingToCart[product._id]
                    }
                    className={`p-2 rounded-full ${
                      !product.countInStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : addingToCart[product._id]
                        ? "bg-gray-200"
                        : "bg-primary text-white hover:bg-primary-dark"
                    }`}
                  >
                    {addingToCart[product._id] ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <FiShoppingCart className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {!product.countInStock && (
                <p className="text-xs text-red-500 mt-1">Out of stock</p>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <Link
          to="/products"
          className="text-primary hover:text-primary-dark flex items-center gap-2"
        >
          <FiArrowLeft /> Continue shopping
        </Link>
      </div>
    </div>
  );
};

export default Wishlist;
