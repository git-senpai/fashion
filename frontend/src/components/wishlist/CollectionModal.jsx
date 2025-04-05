import { useRef, useEffect, useState } from "react";
import { FiX } from "react-icons/fi";
import { toast } from "sonner";

const CollectionModal = ({ isOpen, onClose, onCreateCollection }) => {
  const [newCollectionName, setNewCollectionName] = useState("");
  const newCollectionInputRef = useRef(null);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && newCollectionInputRef.current) {
      setTimeout(() => {
        newCollectionInputRef.current.focus();
      }, 100);
    }
  }, [isOpen]);

  const handleCreateCollection = async (e) => {
    e.preventDefault();

    if (!newCollectionName.trim()) {
      toast.error("Please enter a collection name");
      return;
    }

    try {
      await onCreateCollection(newCollectionName);
      setNewCollectionName("");
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to create collection");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Create New Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
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
              onClick={onClose}
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
  );
};

export default CollectionModal;
