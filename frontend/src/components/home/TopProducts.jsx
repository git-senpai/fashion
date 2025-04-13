import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getTopProducts } from "../../services/productService";
import { toast } from "sonner";
import { FiArrowRight, FiStar } from "react-icons/fi";
import { ProductCard } from "../ProductCard";

const TopProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const data = await getTopProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching top products:", error);
        setError(error.message || "Failed to load top products");
        toast.error("Could not load top-rated products");
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Top Rated Products
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-[320px] rounded-xl bg-gray-100 animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="rounded-lg bg-red-50 p-4 text-red-800">
          <p>Unable to load top products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            <span className="relative">
              <span className="relative z-10">Top Rated Products</span>
              <span className="absolute bottom-0 left-0 right-0 z-0 h-3 bg-primary/10"></span>
            </span>
          </h2>
          <Link
            to="/products"
            className="flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary/80"
          >
            View All <FiArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              No top-rated products available at the moment.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default TopProducts;
