import { useState } from "react";
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const FilterSidebar = ({
  filters,
  handleFilterChange,
  clearFilters,
  categories,
  brands,
  filtersVisible,
  expandedFilters,
  toggleFilter,
}) => {
  return (
    <AnimatePresence>
      {filtersVisible && (
        <motion.aside
          className="mb-6 w-full lg:mb-0 lg:w-72 block lg:block"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-800">Filters</h2>
              <button
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-full bg-gray-50 px-3 py-1 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                <FiX className="h-3 w-3" />
                Clear All
              </button>
            </div>

            {/* Categories */}
            <div className="mb-5 border-b border-gray-100 pb-5">
              <button
                className="mb-3 flex w-full items-center justify-between text-left font-medium text-gray-700"
                onClick={() => toggleFilter("categories")}
              >
                Categories
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                  {expandedFilters.categories ? (
                    <FiChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <FiChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {expandedFilters.categories && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2"
                  >
                    {categories.length > 0 ? (
                      categories.map((category) => (
                        <label
                          key={category}
                          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="category"
                            checked={filters.category === category}
                            onChange={() =>
                              handleFilterChange("category", category)
                            }
                            className="h-4 w-4 text-primary accent-primary"
                          />
                          <span className="text-sm text-gray-600">
                            {category}
                          </span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No categories available
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Brands */}
            <div className="mb-5 border-b border-gray-100 pb-5">
              <button
                className="mb-3 flex w-full items-center justify-between text-left font-medium text-gray-700"
                onClick={() => toggleFilter("brands")}
              >
                Brands
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                  {expandedFilters.brands ? (
                    <FiChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <FiChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {expandedFilters.brands && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2"
                  >
                    {brands.length > 0 ? (
                      brands.map((brand) => (
                        <label
                          key={brand}
                          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50"
                        >
                          <input
                            type="radio"
                            name="brand"
                            checked={filters.brand === brand}
                            onChange={() => handleFilterChange("brand", brand)}
                            className="h-4 w-4 text-primary accent-primary"
                          />
                          <span className="text-sm text-gray-600">{brand}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        No brands available
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Price Range */}
            <div className="mb-5 border-b border-gray-100 pb-5">
              <button
                className="mb-3 flex w-full items-center justify-between text-left font-medium text-gray-700"
                onClick={() => toggleFilter("price")}
              >
                Price Range
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                  {expandedFilters.price ? (
                    <FiChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <FiChevronDown className="h-3.5 w-3.5" />
                  )}
                </span>
              </button>
              <AnimatePresence>
                {expandedFilters.price && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-2 space-y-2"
                  >
                    <label className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.price === "0-50"}
                        onChange={() => handleFilterChange("price", "0-50")}
                        className="h-4 w-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-600">Under $50</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.price === "50-100"}
                        onChange={() => handleFilterChange("price", "50-100")}
                        className="h-4 w-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-600">$50 - $100</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.price === "100-200"}
                        onChange={() => handleFilterChange("price", "100-200")}
                        className="h-4 w-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-600">$100 - $200</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-50">
                      <input
                        type="radio"
                        name="price"
                        checked={filters.price === "200-9999"}
                        onChange={() => handleFilterChange("price", "200-9999")}
                        className="h-4 w-4 text-primary accent-primary"
                      />
                      <span className="text-sm text-gray-600">
                        $200 & Above
                      </span>
                    </label>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Sort Options */}
            <div>
              <label className="mb-2 block font-medium text-gray-700">
                Sort By
              </label>
              <select
                value={filters.sort}
                onChange={(e) => handleFilterChange("sort", e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2.5 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="newest">Newest</option>
                <option value="price-low-high">Price: Low to High</option>
                <option value="price-high-low">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
};

export default FilterSidebar;
