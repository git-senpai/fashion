import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getFeaturedProducts } from "../../services/productService";
import { toast } from "sonner";
import { FiArrowRight } from "react-icons/fi";
import { ProductCard } from "../ProductCard";
import { motion } from "framer-motion";

const FeaturedProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await getFeaturedProducts();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching featured products:", error);
        setError(error.message || "Failed to load featured products");
        toast.error("Could not load featured products");
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Featured Collection
          </h2>
        </div>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(8)].map((_, index) => (
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
          <p>Unable to load featured products: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <motion.h2
            className="mb-2 text-3xl font-bold text-gray-800"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Featured Collection
          </motion.h2>
          <motion.p
            className="mx-auto max-w-2xl text-gray-600"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Discover our carefully selected products that represent the best in
            quality, style, and value
          </motion.p>
        </div>

        {products.length === 0 ? (
          <div className="rounded-lg bg-white p-6 text-center shadow-sm">
            <p className="text-gray-600">
              No featured products available at the moment.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <Link
                to="/products"
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary/90"
              >
                View All Products <FiArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
