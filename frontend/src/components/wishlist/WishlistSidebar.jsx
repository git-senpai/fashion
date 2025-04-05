import { FiFolder, FiPlus, FiX, FiTrash } from "react-icons/fi";

const WishlistSidebar = ({
  collections = [],
  activeCollection,
  isSidebarOpen,
  setIsSidebarOpen,
  totalItemsCount,
  onCollectionChange,
  onDeleteCollection,
  onCreateCollection,
}) => {
  return (
    <div
      className={`md:w-64 bg-white rounded-lg border border-gray-200 shadow-sm p-4 ${
        isSidebarOpen ? "block" : "hidden md:block"
      }`}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold">Collections</h2>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="md:hidden p-2 text-gray-500 hover:text-gray-700"
          aria-label="Close sidebar"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="space-y-2">
        <button
          onClick={() => onCollectionChange("all")}
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
            {totalItemsCount}
          </span>
        </button>

        {collections.map((collection) => (
          <div key={collection._id} className="group">
            <button
              onClick={() => onCollectionChange(collection._id)}
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
                    onDeleteCollection(collection._id);
                  }}
                  className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700"
                  aria-label={`Delete ${collection.name} collection`}
                >
                  <FiTrash size={14} />
                </button>
              </div>
            </button>
          </div>
        ))}

        <button
          onClick={onCreateCollection}
          className="w-full mt-4 flex items-center justify-center px-3 py-2 rounded-md border border-dashed border-gray-300 text-gray-500 hover:text-primary hover:border-primary transition-colors"
        >
          <FiPlus className="mr-2" /> Create Collection
        </button>
      </div>
    </div>
  );
};

export default WishlistSidebar;
