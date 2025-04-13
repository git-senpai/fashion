import { FiX } from "react-icons/fi";

const EmptyProducts = ({ hasFilters, clearFilters }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-4 text-5xl">🔍</div>
      <h3 className="mb-2 text-xl font-semibold">
        {hasFilters ? "No matching products" : "No products found"}
      </h3>
      <p className="mb-6 text-muted-foreground">
        {hasFilters
          ? "Try adjusting your filters or search query"
          : "There are no products available yet"}
      </p>
      {hasFilters && (
        <button
          onClick={clearFilters}
          className="flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          <FiX className="mr-2 h-4 w-4" />
          Clear Filters
        </button>
      )}
    </div>
  );
};

export default EmptyProducts;
