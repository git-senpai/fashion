import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FiShoppingCart, FiTrash, FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useCartStore } from "../../store/useCartStore";
import Spinner from "../../components/ui/Spinner";
import { toast } from "sonner";

const WishlistPage = () => {
  const {
    wishlistItems,
    loading,
    removeFromWishlist,
    clearWishlist,
    initWishlist,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const [addingToCart, setAddingToCart] = useState({});

  useEffect(() => {
    initWishlist();
  }, [initWishlist]);

  const handleAddToCart = async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
    try {
      await addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
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
    if (window.confirm("Are you sure you want to clear your wishlist?")) {
      try {
        await clearWishlist();
      } catch (error) {
        toast.error(error.message || "Failed to clear wishlist");
      }
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading your wishlist...</p>
      </div>
    );
  }

  if (!wishlistItems || wishlistItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">My Wishlist</h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[40vh]"
        >
          <div className="text-gray-300 w-16 h-16 mb-6">❤️</div>
          <h2 className="text-xl font-semibold text-gray-700 mb-4">
            Your wishlist is empty
          </h2>
          <p className="text-gray-500 mb-8 text-center max-w-md">
            Add items to your wishlist by clicking the heart icon on product
            pages.
          </p>
          <Link
            to="/products"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center gap-2"
          >
            <FiArrowLeft /> Explore Products
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
          className="text-red-500 hover:text-red-700 flex items-center gap-1"
        >
          <FiTrash className="h-4 w-4" /> Clear Wishlist
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {wishlistItems.map((product) => (
          <motion.div
            key={product._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col"
          >
            <Link
              to={`/products/${product._id}`}
              className="block h-48 overflow-hidden"
            >
              <img
                src={
                  product.images && product.images.length > 0
                    ? product.images[0]
                    : product.image || "/placeholder-image.jpg"
                }
                alt={product.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
              />
            </Link>

            <div className="p-4 flex flex-col flex-grow">
              <Link
                to={`/products/${product._id}`}
                className="text-lg font-semibold text-gray-800 hover:text-primary transition-colors duration-200 mb-2"
              >
                {product.name}
              </Link>

              <div className="flex items-center mb-3">
                <div className="flex">
                  {Array(5)
                    .fill()
                    .map((_, index) => (
                      <svg
                        key={index}
                        className={`h-4 w-4 ${
                          index < Math.round(product.rating)
                            ? "text-yellow-400 fill-yellow-400"
                            : "text-gray-300"
                        }`}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                </div>
                <span className="text-xs text-gray-500 ml-1">
                  ({product.numReviews})
                </span>
              </div>

              <div className="mt-auto flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">
                  ${product.price.toFixed(2)}
                </span>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRemoveFromWishlist(product._id)}
                    className="text-red-500 hover:text-red-700 p-2"
                  >
                    <FiTrash className="h-5 w-5" />
                  </button>

                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={
                      addingToCart[product._id] || !product.countInStock
                    }
                    className={`p-2 rounded-full ${
                      !product.countInStock
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
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
                <p className="text-xs text-red-500 mt-2">Out of stock</p>
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

export default WishlistPage;
