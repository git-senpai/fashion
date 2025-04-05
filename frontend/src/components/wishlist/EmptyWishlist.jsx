import { Link } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import { motion } from "framer-motion";

const EmptyWishlist = () => {
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
};

export default EmptyWishlist;
