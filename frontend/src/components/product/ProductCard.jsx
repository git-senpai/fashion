import { useState } from "react";
import { Link } from "react-router-dom";
import { FiHeart, FiShoppingCart, FiEye } from "react-icons/fi";
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

  return (
    <>
      <Link
        to={`/products/${safeProduct._id}`}
        className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-white transition-all hover:shadow-md"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Product Image */}
        <div className="relative aspect-square overflow-hidden">
          <motion.img
            src={productImages[currentImageIndex]}
            alt={safeProduct.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400?text=Image+Not+Found";
            }}
            // For accessibility
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          />

          {/* Discount Tag */}
          {safeProduct.discountPercentage > 0 && (
            <div className="absolute left-2 top-2 rounded-md bg-green-500 px-2 py-1 text-xs font-bold text-white">
              {safeProduct.discountPercentage}% OFF
            </div>
          )}

          {/* Out of Stock Tag */}
          {safeProduct.countInStock <= 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
              <span className="rounded-md bg-black/70 px-3 py-1 text-sm font-medium text-white">
                Out of Stock
              </span>
            </div>
          )}

          {/* Quick Action Buttons */}
          <div
            className={`absolute bottom-2 right-2 flex flex-col gap-2 transition-opacity ${
              isHovered ? "opacity-100" : "opacity-0"
            }`}
          >
            <button
              onClick={handleAddToWishlist}
              disabled={addingToWishlist}
              className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
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
              className={`rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white ${
                safeProduct.countInStock <= 0
                  ? "cursor-not-allowed opacity-50"
                  : ""
              }`}
              aria-label="Add to cart"
            >
              {addingToCart ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" />
              ) : (
                <FiShoppingCart className="h-5 w-5" />
              )}
            </button>
            <Link
              to={`/products/${safeProduct._id}`}
              className="rounded-full bg-white p-2 shadow-md transition-colors hover:bg-primary hover:text-white"
              aria-label="View product details"
              onClick={(e) => e.stopPropagation()}
            >
              <FiEye className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {/* Product Info */}
        <div className="flex flex-1 flex-col p-4">
          <h3 className="mb-2 font-medium line-clamp-2">{safeProduct.name}</h3>

          <div className="mb-2 flex items-center">
            <span className="text-yellow-400">★</span>
            <span className="ml-1 text-xs text-muted-foreground">
              {safeProduct.rating.toFixed(1)} ({safeProduct.numReviews} reviews)
            </span>
          </div>

          <div className="mt-auto flex items-center gap-2">
            {safeProduct.discountPercentage > 0 ? (
              <>
                <span className="font-bold text-[#e84a7f]">
                  ${safeProduct.price.toFixed(2)}
                </span>
                <span className="text-xs text-muted-foreground line-through">
                  $
                  {(
                    safeProduct.price /
                    (1 - safeProduct.discountPercentage / 100)
                  ).toFixed(2)}
                </span>
              </>
            ) : (
              <span className="font-bold">${safeProduct.price.toFixed(2)}</span>
            )}
          </div>
        </div>
      </Link>

      {/* Wishlist Modal */}
      <WishlistModal
        isOpen={showWishlistModal}
        onClose={() => setShowWishlistModal(false)}
        collections={collections || []}
        onAddToMainWishlist={addToMainWishlist}
        onAddToCollection={addToCollection}
        onCreateCollection={handleCreateCollection}
        productName={safeProduct.name}
      />
    </>
  );
};

export default ProductCard;
