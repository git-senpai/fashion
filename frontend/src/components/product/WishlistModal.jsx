import { useState, useRef, useEffect } from "react";
import { FiX, FiHeart, FiFolder, FiPlus } from "react-icons/fi";
import { toast } from "sonner";

const WishlistModal = ({
  isOpen,
  onClose,
  collections = [],
  onAddToMainWishlist,
  onAddToCollection,
  onCreateCollection,
  productName,
}) => {
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState("");
  const newCollectionInputRef = useRef(null);

  // Focus input when new collection modal opens
  useEffect(() => {
    if (showNewCollectionModal && newCollectionInputRef.current) {
      setTimeout(() => {
        newCollectionInputRef.current.focus();
      }, 100);
    }
  }, [showNewCollectionModal]);

  if (!isOpen) return null;

  const handleCreateCollection = async (e) => {
    e.preventDefault();

    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    try {
      await onCreateCollection(newCollectionName);
      setNewCollectionName("");
      setShowNewCollectionModal(false);
    } catch (error) {
      toast.error(error.message || "Failed to create collection");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      {showNewCollectionModal ? (
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Create New Collection</h3>
            <button
              onClick={() => setShowNewCollectionModal(false)}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>
          <form onSubmit={handleCreateCollection}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">
                Collection Name
              </label>
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
      ) : (
        <div className="bg-white rounded-lg p-6 w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Add to Wishlist</h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
              aria-label="Close"
            >
              <FiX size={20} />
            </button>
          </div>

          <div className="mb-4">
            <h4 className="text-sm font-medium mb-3">
              Where would you like to save {productName}?
            </h4>

            <button
              onClick={onAddToMainWishlist}
              className="w-full text-left p-3 rounded-md hover:bg-gray-100 flex items-center mb-2"
            >
              <FiHeart className="mr-2 text-primary" /> Add to main wishlist
            </button>

            {collections.length > 0 && (
              <div className="border-t border-gray-200 my-3 pt-3">
                <h4 className="text-sm font-medium mb-2 text-gray-700">
                  Or add to a collection:
                </h4>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {collections.map((collection) => (
                    <button
                      key={collection._id}
                      onClick={() => onAddToCollection(collection._id)}
                      className="w-full text-left p-2 rounded-md hover:bg-gray-100 flex items-center"
                    >
                      <FiFolder className="mr-2 text-gray-500" />
                      {collection.name}
                      <span className="ml-auto text-xs text-gray-500">
                        {collection.products?.length || 0} items
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => setShowNewCollectionModal(true)}
              className="w-full mt-4 flex items-center justify-center p-2 rounded-md border border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary transition-colors"
            >
              <FiPlus className="mr-2" /> Create New Collection
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistModal;
