import { Link } from "react-router-dom";
import { FiRefreshCw } from "react-icons/fi";

const WishlistError = ({ error, onRetry }) => {
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
            onClick={onRetry}
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
};

export default WishlistError;
