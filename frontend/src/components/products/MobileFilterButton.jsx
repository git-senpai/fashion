import { FiFilter, FiChevronDown, FiChevronUp } from "react-icons/fi";

const MobileFilterButton = ({ filtersVisible, toggleFiltersVisible }) => {
  return (
    <div className="sticky top-0 z-10 mb-4 lg:hidden">
      <button
        onClick={toggleFiltersVisible}
        className="flex w-full items-center justify-between rounded-full border border-gray-200 bg-white px-5 py-3 font-medium shadow-sm transition hover:border-primary/20 hover:shadow"
      >
        <span className="flex items-center gap-2 text-gray-800">
          <FiFilter className="h-4 w-4 text-primary" />
          Filters
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-600">
          {filtersVisible ? (
            <FiChevronUp className="h-4 w-4" />
          ) : (
            <FiChevronDown className="h-4 w-4" />
          )}
        </div>
      </button>
    </div>
  );
};

export default MobileFilterButton;
