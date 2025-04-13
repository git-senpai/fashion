import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiArrowRight } from "react-icons/fi";
import { ProductCard } from "../ProductCard";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuth } from "../../hooks/useAuth";
import { getProductDetails } from "../../services/productService";
import { motion } from "framer-motion";

const UserLikedProducts = ({ currentProductId }) => {
  const [likedProducts, setLikedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { wishlistItems, collections, getActiveCollectionItems, isInWishlist } =
    useWishlistStore();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const fetchLikedProducts = async () => {
      if (!isAuthenticated) {
        setLikedProducts([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Get all user's wishlist items
        const allWishlistItems = getActiveCollectionItems();

        // Filter out the current product and limit to 4
        const filteredItems = allWishlistItems
          .filter((item) => item._id !== currentProductId)
          .slice(0, 4);

        // Load full product details for each item
        const productsPromises = filteredItems.map(async (item) => {
          const productId = typeof item === "string" ? item : item._id;
          try {
            return await getProductDetails(productId);
          } catch (error) {
            console.error(
              `Failed to fetch details for product ${productId}:`,
              error
            );
            return null;
          }
        });

        const productsWithDetails = await Promise.all(productsPromises);
        setLikedProducts(productsWithDetails.filter((p) => p !== null));
      } catch (error) {
        console.error("Error fetching liked products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProducts();
  }, [
    isAuthenticated,
    wishlistItems,
    collections,
    currentProductId,
    getActiveCollectionItems,
  ]);

  // If user is not authenticated or has no liked products
  if (!isAuthenticated || (likedProducts.length === 0 && !loading)) {
    return null;
  }

  return (
    <section className="mt-12 rounded-xl bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">
          <span className="flex items-center gap-2">
            <FiHeart className="text-primary" />
            Products You've Liked
          </span>
        </h2>
        <Link
          to="/wishlist"
          className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          View Wishlist <FiArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-[320px] rounded-xl bg-gray-100 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {likedProducts.map((product, index) => (
            <motion.div
              key={product._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>
      )}
    </section>
  );
};

export default UserLikedProducts;
