import { ProductCard } from "../ProductCard";
import ProductsLoading from "./ProductsLoading";
import EmptyProducts from "./EmptyProducts";

const ProductsGrid = ({
  loading,
  products,
  sortedProducts,
  filters,
  keyword,
  clearFilters,
}) => {
  const hasFilters = !!(
    filters.category ||
    filters.brand ||
    filters.price ||
    keyword
  );

  if (loading) {
    return <ProductsLoading />;
  }

  if (!Array.isArray(products) || products.length === 0) {
    return (
      <EmptyProducts hasFilters={hasFilters} clearFilters={clearFilters} />
    );
  }

  if (sortedProducts.length === 0) {
    return (
      <EmptyProducts hasFilters={hasFilters} clearFilters={clearFilters} />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {sortedProducts.map((product) => (
        <ProductCard key={product._id} product={product} />
      ))}
    </div>
  );
};

export default ProductsGrid;
