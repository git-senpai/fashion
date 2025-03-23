import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { FiFilter, FiX, FiChevronDown, FiChevronUp } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { getProducts } from "../services/productService";
import { ProductCard } from "../components/ProductCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { toast } from "sonner";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    brand: "",
    price: "",
    sort: "newest",
  });
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [expandedFilters, setExpandedFilters] = useState({
    categories: true,
    brands: true,
    price: true,
  });

  const keyword = searchParams.get("search") || "";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        console.log("Fetching products with keyword:", keyword);
        const data = await getProducts(keyword);
        console.log("API Response:", data);

        // Check if data has a products property (API returns {products, page, pages})
        if (data && Array.isArray(data.products)) {
          setProducts(data.products);
          console.log(
            "Set products from data.products array:",
            data.products.length
          );
        } else if (Array.isArray(data)) {
          // Fallback in case the API directly returns an array
          setProducts(data);
          console.log("Set products from direct array:", data.length);
        } else {
          console.error("Unexpected API response format:", data);
          setError("Unexpected data format from API");
          toast.error("Failed to load products. Unexpected data format.");
          setProducts([]);
        }
      } catch (error) {
        console.error("Error fetching products:", error);
        setError(error.message || "Failed to load products");
        toast.error("Failed to load products. Please try again.");
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [keyword]);

  // Function to filter products client-side
  const filteredProducts = Array.isArray(products)
    ? products.filter((product) => {
        if (!product) return false;

        // Filter by category
        if (filters.category && product.category !== filters.category) {
          return false;
        }

        // Filter by brand
        if (filters.brand && product.brand !== filters.brand) {
          return false;
        }

        // Filter by price
        if (filters.price) {
          const [min, max] = filters.price.split("-").map(Number);
          if (product.price < min || (max && product.price > max)) {
            return false;
          }
        }

        return true;
      })
    : [];

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (!a || !b) return 0;

    switch (filters.sort) {
      case "price-low-high":
        return (a.price || 0) - (b.price || 0);
      case "price-high-low":
        return (b.price || 0) - (a.price || 0);
      case "rating":
        return (b.rating || 0) - (a.rating || 0);
      case "newest":
      default:
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date();
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date();
        return dateB - dateA;
    }
  });

  // Get unique categories and brands for filters
  const categories = Array.isArray(products)
    ? [
        ...new Set(
          products.filter((p) => p && p.category).map((p) => p.category)
        ),
      ]
    : [];

  const brands = Array.isArray(products)
    ? [...new Set(products.filter((p) => p && p.brand).map((p) => p.brand))]
    : [];

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    if (name === "category") {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        category: value,
      });
    }
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      price: "",
      sort: "newest",
    });
    setSearchParams({ search: keyword });
  };

  const toggleFilter = (filter) => {
    setExpandedFilters({
      ...expandedFilters,
      [filter]: !expandedFilters[filter],
    });
  };

  // If there's an error, display it
  if (error && !loading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="mb-4 text-2xl font-bold text-destructive">
          Error Loading Products
        </h2>
        <p className="mb-8">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">All Products</h1>
        {keyword && (
          <p className="mt-2 text-muted-foreground">
            Search results for: <span className="font-medium">{keyword}</span>
          </p>
        )}
        {filters.category && (
          <p className="mt-2 text-muted-foreground">
            Category: <span className="font-medium">{filters.category}</span>
          </p>
        )}
      </div>

      <div className="flex flex-col lg:flex-row lg:gap-8">
        {/* Mobile Filter Button */}
        <div className="mb-4 lg:hidden">
          <button
            onClick={() => setFiltersVisible(!filtersVisible)}
            className="flex w-full items-center justify-between rounded-md border border-border bg-card p-3 shadow-sm"
          >
            <span className="flex items-center font-medium">
              <FiFilter className="mr-2 h-4 w-4" />
              Filters
            </span>
            {filtersVisible ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>

        {/* Filters */}
        <AnimatePresence>
          {(filtersVisible ||
            (Array.isArray(products) && products.length > 0)) && (
            <motion.aside
              className={`mb-6 w-full lg:mb-0 lg:w-64 ${
                filtersVisible ? "block" : "hidden lg:block"
              }`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold">Filters</h2>
                  <button
                    onClick={clearFilters}
                    className="flex items-center text-sm text-primary hover:text-primary/80"
                  >
                    <FiX className="mr-1 h-3 w-3" />
                    Clear All
                  </button>
                </div>

                {/* Categories */}
                <div className="mb-6 border-b border-border pb-4">
                  <button
                    className="mb-2 flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFilter("categories")}
                  >
                    Categories
                    {expandedFilters.categories ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                  {expandedFilters.categories && (
                    <div className="mt-2 space-y-2">
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <label key={category} className="flex items-center">
                            <input
                              type="radio"
                              name="category"
                              checked={filters.category === category}
                              onChange={() =>
                                handleFilterChange("category", category)
                              }
                              className="h-4 w-4 text-primary"
                            />
                            <span className="ml-2 text-sm">{category}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No categories available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Brands */}
                <div className="mb-6 border-b border-border pb-4">
                  <button
                    className="mb-2 flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFilter("brands")}
                  >
                    Brands
                    {expandedFilters.brands ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                  {expandedFilters.brands && (
                    <div className="mt-2 space-y-2">
                      {brands.length > 0 ? (
                        brands.map((brand) => (
                          <label key={brand} className="flex items-center">
                            <input
                              type="radio"
                              name="brand"
                              checked={filters.brand === brand}
                              onChange={() =>
                                handleFilterChange("brand", brand)
                              }
                              className="h-4 w-4 text-primary"
                            />
                            <span className="ml-2 text-sm">{brand}</span>
                          </label>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No brands available
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Price Range */}
                <div className="mb-6 border-b border-border pb-4">
                  <button
                    className="mb-2 flex w-full items-center justify-between text-left font-medium"
                    onClick={() => toggleFilter("price")}
                  >
                    Price Range
                    {expandedFilters.price ? (
                      <FiChevronUp />
                    ) : (
                      <FiChevronDown />
                    )}
                  </button>
                  {expandedFilters.price && (
                    <div className="mt-2 space-y-2">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.price === "0-50"}
                          onChange={() => handleFilterChange("price", "0-50")}
                          className="h-4 w-4 text-primary"
                        />
                        <span className="ml-2 text-sm">Under $50</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.price === "50-100"}
                          onChange={() => handleFilterChange("price", "50-100")}
                          className="h-4 w-4 text-primary"
                        />
                        <span className="ml-2 text-sm">$50 - $100</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.price === "100-200"}
                          onChange={() =>
                            handleFilterChange("price", "100-200")
                          }
                          className="h-4 w-4 text-primary"
                        />
                        <span className="ml-2 text-sm">$100 - $200</span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="price"
                          checked={filters.price === "200-9999"}
                          onChange={() =>
                            handleFilterChange("price", "200-9999")
                          }
                          className="h-4 w-4 text-primary"
                        />
                        <span className="ml-2 text-sm">$200 & Above</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Sort Options */}
                <div>
                  <label className="mb-2 block font-medium">Sort By</label>
                  <select
                    value={filters.sort}
                    onChange={(e) => handleFilterChange("sort", e.target.value)}
                    className="w-full rounded-md border border-input bg-background p-2 text-sm"
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

        {/* Products Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[...Array(8)].map((_, index) => (
                <div key={index} className="h-80">
                  <Skeleton height={280} className="mb-2" />
                  <Skeleton height={20} width="80%" className="mb-1" />
                  <Skeleton height={20} width="60%" />
                </div>
              ))}
            </div>
          ) : !Array.isArray(products) || products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold">No products found</h3>
              <p className="mb-6 text-muted-foreground">
                {filters.category || filters.brand || filters.price || keyword
                  ? "Try adjusting your filters or search query"
                  : "There are no products available yet"}
              </p>
              {(filters.category ||
                filters.brand ||
                filters.price ||
                keyword) && (
                <button
                  onClick={clearFilters}
                  className="flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
                >
                  <FiX className="mr-2 h-4 w-4" />
                  Clear Filters
                </button>
              )}
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 text-5xl">🔍</div>
              <h3 className="mb-2 text-xl font-semibold">
                No matching products
              </h3>
              <p className="mb-6 text-muted-foreground">
                Try adjusting your filters or search query
              </p>
              <button
                onClick={clearFilters}
                className="flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
              >
                <FiX className="mr-2 h-4 w-4" />
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {sortedProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Products;
