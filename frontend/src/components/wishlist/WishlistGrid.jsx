import { AnimatePresence } from "framer-motion";
import { FiFolder, FiArrowLeft } from "react-icons/fi";
import { Link } from "react-router-dom";
import WishlistItem from "./WishlistItem";

const WishlistGrid = ({
  items = [],
  activeCollection,
  collections = [],
  onRemoveItem,
  onAddToCart,
  onMoveItem,
  collectionName,
}) => {
  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center">
        <FiFolder className="mx-auto h-12 w-12 text-gray-300 mb-4" />
        <h3 className="text-lg font-medium mb-2">
          {activeCollection === "all"
            ? "Your wishlist is empty"
            : "This collection is empty"}
        </h3>
        <p className="text-gray-500 mb-6">
          {activeCollection === "all"
            ? "Add items to your wishlist while browsing products"
            : "Add items to this collection from your wishlist"}
        </p>
        <Link
          to="/products"
          className="inline-flex items-center text-primary hover:underline"
        >
          <FiArrowLeft className="mr-2" /> Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <AnimatePresence>
        {items.map((product) => (
          <WishlistItem
            key={product._id}
            product={product}
            onRemove={onRemoveItem}
            onAddToCart={onAddToCart}
            onMove={onMoveItem}
            hasCollections={collections.length > 0}
            activeCollection={activeCollection}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default WishlistGrid;
