import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts } from "../services/productService";
import { toast } from "sonner";
import {
  ProductsError,
  ProductsGrid,
  ProductsHeader,
} from "../components/products";
import { FiChevronDown, FiX } from "react-icons/fi";

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    price: "",
    sort: "newest",
  });
  const [openDropdown, setOpenDropdown] = useState(null);

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

  // Get unique categories for filter
  const categories = Array.isArray(products)
    ? [
        ...new Set(
          products.filter((p) => p && p.category).map((p) => p.category)
        ),
      ]
    : [];

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
    if (name === "category") {
      setSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        category: value,
      });
    }
    setOpenDropdown(null);
  };

  const clearFilters = () => {
    setFilters({
      category: "",
      price: "",
      sort: "newest",
    });
    setSearchParams({ search: keyword });
  };

  const toggleDropdown = (dropdown) => {
    setOpenDropdown(openDropdown === dropdown ? null : dropdown);
  };

  // Handle clicking outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".dropdown-container")) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // If there's an error, display it
  if (error && !loading) {
    return <ProductsError error={error} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 sm:py-8">
        {/* Header */}
        <ProductsHeader keyword={keyword} filters={filters} />

        {/* Top Filters Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-xl bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            {/* Category Dropdown */}
            <div className="dropdown-container relative">
              <button
                onClick={() => toggleDropdown("category")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Category: {filters.category || "All"}
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "category" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "category" && (
                <div className="absolute z-10 mt-2 w-56 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <div className="mb-2 border-b border-gray-100 pb-2">
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                        !filters.category
                          ? "bg-primary/10 font-medium text-primary"
                          : ""
                      }`}
                    >
                      All Categories
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto">
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => handleFilterChange("category", category)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                          filters.category === category
                            ? "bg-primary/10 font-medium text-primary"
                            : ""
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price Range Dropdown */}
            <div className="dropdown-container relative">
              <button
                onClick={() => toggleDropdown("price")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Price:{" "}
                {filters.price
                  ? filters.price === "0-50"
                    ? "Under $50"
                    : filters.price === "50-100"
                    ? "$50 - $100"
                    : filters.price === "100-200"
                    ? "$100 - $200"
                    : "$200+"
                  : "All"}
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "price" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "price" && (
                <div className="absolute z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <button
                    onClick={() => handleFilterChange("price", "")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      !filters.price
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    All Prices
                  </button>
                  <button
                    onClick={() => handleFilterChange("price", "0-50")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.price === "0-50"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    Under $50
                  </button>
                  <button
                    onClick={() => handleFilterChange("price", "50-100")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.price === "50-100"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    $50 - $100
                  </button>
                  <button
                    onClick={() => handleFilterChange("price", "100-200")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.price === "100-200"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    $100 - $200
                  </button>
                  <button
                    onClick={() => handleFilterChange("price", "200-9999")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.price === "200-9999"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    $200 & Above
                  </button>
                </div>
              )}
            </div>

            {/* Sort Dropdown */}
            <div className="dropdown-container relative">
              <button
                onClick={() => toggleDropdown("sort")}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                Sort:{" "}
                {filters.sort === "newest"
                  ? "Newest"
                  : filters.sort === "price-low-high"
                  ? "Price: Low to High"
                  : filters.sort === "price-high-low"
                  ? "Price: High to Low"
                  : filters.sort === "rating"
                  ? "Top Rated"
                  : "Newest"}
                <FiChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === "sort" ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openDropdown === "sort" && (
                <div className="absolute z-10 mt-2 w-48 rounded-lg border border-gray-200 bg-white p-2 shadow-lg">
                  <button
                    onClick={() => handleFilterChange("sort", "newest")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.sort === "newest"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    Newest
                  </button>
                  <button
                    onClick={() => handleFilterChange("sort", "price-low-high")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.sort === "price-low-high"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    Price: Low to High
                  </button>
                  <button
                    onClick={() => handleFilterChange("sort", "price-high-low")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.sort === "price-high-low"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    Price: High to Low
                  </button>
                  <button
                    onClick={() => handleFilterChange("sort", "rating")}
                    className={`w-full rounded-md px-3 py-2 text-left text-sm hover:bg-gray-50 ${
                      filters.sort === "rating"
                        ? "bg-primary/10 font-medium text-primary"
                        : ""
                    }`}
                  >
                    Top Rated
                  </button>
                </div>
              )}
            </div>

            {/* Active Filters */}
            {(filters.category || filters.price) && (
              <div className="flex gap-2">
                {filters.category && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {filters.category}
                    <button
                      onClick={() => handleFilterChange("category", "")}
                      className="rounded-full hover:bg-primary/20"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
                {filters.price && (
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm text-primary">
                    {filters.price === "0-50"
                      ? "Under $50"
                      : filters.price === "50-100"
                      ? "$50 - $100"
                      : filters.price === "100-200"
                      ? "$100 - $200"
                      : "$200+"}
                    <button
                      onClick={() => handleFilterChange("price", "")}
                      className="rounded-full hover:bg-primary/20"
                    >
                      <FiX className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clear Filters */}
          {(filters.category || filters.price || filters.sort !== "newest") && (
            <button
              onClick={clearFilters}
              className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        {/* Products Grid */}
        <div className="flex-1">
          <ProductsGrid
            loading={loading}
            products={products}
            sortedProducts={sortedProducts}
            filters={filters}
            keyword={keyword}
            clearFilters={clearFilters}
          />
        </div>
      </div>
    </div>
  );
};

export default Products;
