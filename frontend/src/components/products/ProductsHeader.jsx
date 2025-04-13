import { FiSearch, FiGrid } from "react-icons/fi";

const ProductsHeader = ({ keyword, filters }) => {
  return (
    <div className="mb-0">
      {/* <h1 className="mb-4 text-2xl font-bold text-gray-800 sm:text-3xl">
        <span className="relative inline-block">
          <span className="relative z-10">Products</span>
          <span className="absolute bottom-0 left-0 right-0 z-0 h-3 bg-primary/10"></span>
        </span>
      </h1> */}

      <div className="flex flex-wrap items-center gap-3">
        {keyword && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700">
            <FiSearch className="h-3.5 w-3.5 text-primary" />
            <span>{keyword}</span>
          </span>
        )}

        {filters.category && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
            <FiGrid className="h-3.5 w-3.5" />
            <span>{filters.category}</span>
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductsHeader;
