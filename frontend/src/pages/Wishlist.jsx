import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiFolder } from "react-icons/fi";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import { toast } from "sonner";

// Import our modular components
import {
  WishlistSidebar,
  WishlistGrid,
  CollectionModal,
  MoveItemModal,
  WishlistError,
  EmptyWishlist,
  WishlistLoading,
} from "../components/wishlist";

const Wishlist = () => {
  const {
    wishlistItems,
    collections,
    activeCollection,
    loading,
    error,
    removeFromWishlist,
    clearWishlist,
    initWishlist,
    setActiveCollection,
    getActiveCollectionItems,
    createCollection,
    deleteCollection,
    removeProductFromCollection,
    moveProductBetweenCollections,
    addToWishlist,
  } = useWishlistStore();

  const { addToCart } = useCartStore();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [productToMove, setProductToMove] = useState(null);
  const [sourceCollection, setSourceCollection] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Handle URL query params for collection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const collectionId = params.get("collection");

    if (collectionId) {
      // Verify the collection exists
      const collectionExists = collections.some(
        (col) => col._id === collectionId
      );
      if (collectionExists) {
        setActiveCollection(collectionId);
      } else {
        // If collection doesn't exist, default to "all"
        setActiveCollection("all");
        // Remove the query parameter
        navigate("/wishlist", { replace: true });
      }
    }
  }, [location.search, collections, setActiveCollection, navigate]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login?redirect=wishlist");
    } else {
      initWishlist();
    }
  }, [isAuthenticated, navigate, initWishlist]);

  // Get items to display based on active collection
  const displayItems = getActiveCollectionItems();

  // Get active collection name
  const getActiveCollectionName = () => {
    if (activeCollection === "all") return "All Items";
    const collection = collections.find((c) => c._id === activeCollection);
    return collection ? collection.name : "Collection";
  };

  // Get total number of wishlist items (main + all collections)
  const getTotalItemsCount = () => {
    // Get unique items from all collections
    const allItems = getActiveCollectionItems();
    return allItems.length;
  };

  const handleAddToCart = async (product) => {
    try {
      // Create cart item with required properties
      const cartItem = {
        productId: product._id,
        name: product.name,
        image: getProductImage(product),
        price: product.price,
        countInStock: product.countInStock,
        quantity: 1,
      };

      await addToCart(cartItem);
      toast.success(`${product.name} added to cart`);
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
      return false;
    }
  };

  const handleRemoveFromWishlist = async (productId) => {
    try {
      if (activeCollection === "all") {
        await removeFromWishlist(productId);
      } else {
        await removeProductFromCollection(activeCollection, productId);
      }
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

  const handleDeleteCollection = async (collectionId) => {
    if (window.confirm("Are you sure you want to delete this collection?")) {
      try {
        await deleteCollection(collectionId);
        toast.success("Collection deleted");
      } catch (error) {
        toast.error(error.message || "Failed to delete collection");
      }
    }
  };

  const handleCreateCollection = async (collectionName) => {
    try {
      await createCollection(collectionName);
      return true;
    } catch (error) {
      toast.error(error.message || "Failed to create collection");
      return false;
    }
  };

  const handleMoveToCollection = (product, sourceCollectionId) => {
    setProductToMove(product);
    setSourceCollection(sourceCollectionId);
    setShowMoveModal(true);
  };

  const handleMoveConfirm = async (targetCollectionId) => {
    if (!productToMove || !targetCollectionId) return;

    try {
      // If source is "all" (main wishlist), add to collection and remove from main wishlist
      if (sourceCollection === "all") {
        // First add to target collection
        await addToWishlist(productToMove, targetCollectionId);

        // Then remove from main wishlist
        await removeFromWishlist(productToMove._id);

        toast.success(`${productToMove.name} moved to collection`);
      } else {
        // Move between collections
        await moveProductBetweenCollections(
          sourceCollection,
          productToMove._id,
          targetCollectionId
        );
        toast.success(`${productToMove.name} moved to new collection`);
      }

      // Refresh collections and wishlist to ensure UI is updated
      await initWishlist();
    } catch (error) {
      console.error("Failed to move item:", error);
      toast.error(error.message || "Failed to move item");
    } finally {
      setShowMoveModal(false);
      setProductToMove(null);
      setSourceCollection(null);
    }
  };

  const handleRetry = () => {
    initWishlist();
  };

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

  // Update URL when active collection changes
  const handleCollectionChange = (collectionId) => {
    setActiveCollection(collectionId);

    // Update URL with the collection ID, but only if it's not "all"
    if (collectionId === "all") {
      navigate("/wishlist", { replace: true });
    } else {
      navigate(`/wishlist?collection=${collectionId}`, { replace: true });
    }
  };

  if (loading) {
    return <WishlistLoading />;
  }

  if (error) {
    return <WishlistError error={error} onRetry={handleRetry} />;
  }

  if (
    (!wishlistItems || wishlistItems.length === 0) &&
    (!collections ||
      collections.length === 0 ||
      collections.every((c) => c.products.length === 0))
  ) {
    return <EmptyWishlist />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <WishlistSidebar
          collections={collections}
          activeCollection={activeCollection}
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          totalItemsCount={getTotalItemsCount()}
          onCollectionChange={handleCollectionChange}
          onDeleteCollection={handleDeleteCollection}
          onCreateCollection={() => setShowNewCollectionModal(true)}
        />

        {/* Main Content */}
        <div className="flex-1">
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="mr-3 md:hidden p-2 text-gray-500 hover:text-gray-700"
              >
                <FiFolder size={18} />
              </button>
              <h1 className="text-2xl font-bold">
                {getActiveCollectionName()} ({displayItems.length})
              </h1>
            </div>

            {activeCollection === "all" && wishlistItems.length > 0 && (
              <button
                onClick={handleClearWishlist}
                className="text-sm text-red-500 hover:text-red-700 transition-colors duration-200"
              >
                Clear All
              </button>
            )}
          </div>

          <WishlistGrid
            items={displayItems}
            activeCollection={activeCollection}
            collections={collections}
            onRemoveItem={handleRemoveFromWishlist}
            onAddToCart={handleAddToCart}
            onMoveItem={handleMoveToCollection}
            collectionName={getActiveCollectionName()}
          />
        </div>
      </div>

      {/* New Collection Modal */}
      <CollectionModal
        isOpen={showNewCollectionModal}
        onClose={() => setShowNewCollectionModal(false)}
        onCreateCollection={handleCreateCollection}
      />

      {/* Move Item Modal */}
      <MoveItemModal
        isOpen={showMoveModal}
        onClose={() => setShowMoveModal(false)}
        onMove={handleMoveConfirm}
        onCreateCollection={() => setShowNewCollectionModal(true)}
        collections={collections}
        productToMove={productToMove}
        sourceCollection={sourceCollection}
      />
    </div>
  );
};

export default Wishlist;
