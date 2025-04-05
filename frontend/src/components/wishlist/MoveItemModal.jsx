import { FiX, FiFolder } from "react-icons/fi";

const MoveItemModal = ({
  isOpen,
  onClose,
  onMove,
  onCreateCollection,
  collections = [],
  productToMove,
  sourceCollection,
}) => {
  if (!isOpen || !productToMove) return null;

  const filteredCollections = collections.filter(
    (c) => c._id !== sourceCollection
  );

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Move to Collection</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
            aria-label="Close modal"
          >
            <FiX size={20} />
          </button>
        </div>
        <div className="mb-4">
          <p className="text-sm text-gray-600 mb-2">
            Select a collection to move <strong>{productToMove.name}</strong>{" "}
            to:
          </p>
          <div className="max-h-60 overflow-y-auto space-y-2 border border-gray-200 rounded-md p-2">
            {filteredCollections.length > 0 ? (
              filteredCollections.map((collection) => (
                <button
                  key={collection._id}
                  onClick={() => onMove(collection._id)}
                  className="w-full text-left p-2 rounded-md hover:bg-gray-100 flex items-center"
                >
                  <FiFolder className="mr-2 text-gray-500" />
                  {collection.name}
                  <span className="ml-auto text-xs text-gray-500">
                    {collection.products.length} items
                  </span>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p>You need at least two collections to move items.</p>
                <button
                  onClick={() => {
                    onClose();
                    setTimeout(onCreateCollection, 300);
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
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default MoveItemModal;
