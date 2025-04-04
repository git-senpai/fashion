import { useEffect, useState, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  FiShoppingCart,
  FiTrash,
  FiArrowLeft,
  FiRefreshCw,
  FiPlus,
  FiFolder,
  FiChevronRight,
  FiChevronDown,
  FiMove,
  FiX,
  FiEdit,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlistStore } from "../store/useWishlistStore";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import { toast } from "sonner";

const Wishlist = () => {
  const {
    wishlistItems,
    collections,
    activeCollection,
    loading,
    error,
    collectionsLoading,
    collectionsError,
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
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [addingToCart, setAddingToCart] = useState({});
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [productToMove, setProductToMove] = useState(null);
  const [sourceCollection, setSourceCollection] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  
  const newCollectionInputRef = useRef(null);
  
  // Handle URL query params for collection
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const collectionId = params.get('collection');
    
    if (collectionId) {
      // Verify the collection exists
      const collectionExists = collections.some(col => col._id === collectionId);
      if (collectionExists) {
        setActiveCollection(collectionId);
      } else {
        // If collection doesn't exist, default to "all"
        setActiveCollection("all");
        // Remove the query parameter
        navigate('/wishlist', { replace: true });
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
  
  // Focus input when new collection modal opens
  useEffect(() => {
    if (showNewCollectionModal && newCollectionInputRef.current) {
      setTimeout(() => {
        newCollectionInputRef.current.focus();
      }, 100);
    }
  }, [showNewCollectionModal]);
  
  // Get items to display based on active collection
  const displayItems = getActiveCollectionItems();
  
  // Get active collection name
  const getActiveCollectionName = () => {
    if (activeCollection === "all") return "All Items";
    const collection = collections.find(c => c._id === activeCollection);
    return collection ? collection.name : "Collection";
  };

  // Get total number of wishlist items (main + all collections)
  const getTotalItemsCount = () => {
    // Get unique items from all collections
    const allItems = getActiveCollectionItems();
    return allItems.length;
  };

  const handleAddToCart = async (product) => {
    setAddingToCart((prev) => ({ ...prev, [product._id]: true }));
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
    } catch (error) {
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart((prev) => ({ ...prev, [product._id]: false }));
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

  const handleCreateCollection = async (e) => {
    e.preventDefault();
    
    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }
    
    try {
      await createCollection(newCollectionName);
      setNewCollectionName("");
      setShowNewCollectionModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to create collection");
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
      navigate('/wishlist', { replace: true });
    } else {
      navigate(`/wishlist?collection=${collectionId}`, { replace: true });
    }
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

  if ((!wishlistItems || wishlistItems.length === 0) && (!collections || collections.length === 0 || collections.every(c => c.products.length === 0))) {
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
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className={`md:w-64 bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${isSidebarOpen ? 'block' : 'hidden md:block'}`}>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Collections</h2>
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-700"
            >
              <FiX size={18} />
            </button>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => handleCollectionChange("all")}
              className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                activeCollection === "all"
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-gray-100"
              }`}
            >
              <div className="flex items-center">
                <FiFolder className="mr-2" /> All Items
              </div>
              <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                {getTotalItemsCount()}
              </span>
            </button>
            
            {collections.map((collection) => (
              <div key={collection._id} className="group">
                <button
                  onClick={() => handleCollectionChange(collection._id)}
                  className={`w-full text-left px-3 py-2 rounded-md flex items-center justify-between ${
                    activeCollection === collection._id
                      ? "bg-primary/10 text-primary"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center">
                    <FiFolder className="mr-2" /> {collection.name}
                  </div>
                  <div className="flex items-center">
                    <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full mr-2">
                      {collection.products.length}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCollection(collection._id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                    >
                      <FiTrash size={14} />
                    </button>
                  </div>
                </button>
              </div>
            ))}
            
            <button
              onClick={() => setShowNewCollectionModal(true)}
              className="w-full mt-4 flex items-center justify-center px-3 py-2 rounded-md border border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary transition-colors"
            >
              <FiPlus className="mr-2" /> Create Collection
            </button>
          </div>
        </div>
        
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

          {displayItems.length === 0 ? (
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
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {displayItems.map((product) => (
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
                        
                        {collections.length > 0 && (
                          <button
                            onClick={() => handleMoveToCollection(product, activeCollection)}
                            className="p-2 text-gray-500 hover:text-blue-600 rounded-full"
                          >
                            <FiMove className="h-5 w-5" />
                          </button>
                        )}
                        
                        <button
                          onClick={() => handleAddToCart(product)}
                          disabled={
                            !product.countInStock || addingToCart[product._id]
                          }
                          className={`p-2 rounded-full ${
                            !product.countInStock
                              ? "text-gray-400 cursor-not-allowed"
                              : addingToCart[product._id]
                              ? "text-gray-400"
                              : "text-gray-500 hover:text-primary"
                          }`}
                        >
                          {addingToCart[product._id] ? (
                            <div className="h-5 w-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin"></div>
                          ) : (
                            <FiShoppingCart className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* New Collection Modal */}
      {showNewCollectionModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Create New Collection</h3>
              <button 
                onClick={() => setShowNewCollectionModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCollection}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Collection Name</label>
                <input
                  ref={newCollectionInputRef}
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="e.g., Summer Favorites"
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  maxLength={30}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowNewCollectionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                  disabled={!newCollectionName.trim()}
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Move Item Modal */}
      {showMoveModal && productToMove && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Move to Collection</h3>
              <button 
                onClick={() => setShowMoveModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FiX size={20} />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">Select a collection to move <strong>{productToMove.name}</strong> to:</p>
              <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
                {collections
                  .filter(c => c._id !== sourceCollection) // Filter out current collection
                  .map(collection => (
                    <button
                      key={collection._id}
                      onClick={() => handleMoveConfirm(collection._id)}
                      className="w-full text-left p-2 rounded-md hover:bg-gray-100 flex items-center"
                    >
                      <FiFolder className="mr-2 text-gray-500" />
                      {collection.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {collection.products.length} items
                      </span>
                    </button>
                  ))}
                
                {collections.length <= 1 && (
                  <div className="p-4 text-center text-gray-500">
                    <p>You need at least two collections to move items.</p>
                    <button
                      onClick={() => {
                        setShowMoveModal(false);
                        setTimeout(() => setShowNewCollectionModal(true), 300);
                      }}
                      className="mt-2 text-primary hover:underline"
                    >
                      Create a new collection
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowMoveModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
