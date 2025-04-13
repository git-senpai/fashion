import { useEffect, useState } from "react";
import { ProductCard } from "../ProductCard";
import { getProducts } from "../../services/productService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { FiGrid } from "react-icons/fi";

const RelatedProducts = ({ currentProductId, categoryId }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!categoryId) return;

      try {
        setLoading(true);

        // Use the category to fetch related products
        const category =
          typeof categoryId === "string" ? categoryId : categoryId.toString();
        const result = await getProducts("", "", category);

        // Filter out the current product and limit to 4 related products
        const filtered = Array.isArray(result.products)
          ? result.products
              .filter((prod) => prod._id !== currentProductId)
              .slice(0, 4)
          : [];

        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [currentProductId, categoryId]);

  if (!categoryId) return null;

  // Only render if we have related products or are still loading
  if (!loading && relatedProducts.length === 0) return null;

  return (
    <section className="mt-12 rounded-xl bg-white p-5 shadow-sm sm:p-8">
      <div className="mb-6 flex items-center">
        <h2 className="text-2xl font-bold text-gray-800">
          <span className="flex items-center gap-2">
            <FiGrid className="text-primary" />
            Similar Products
          </span>
        </h2>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="h-[320px] rounded-xl bg-gray-100 animate-pulse"
            ></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct._id} product={relatedProduct} />
          ))}
        </div>
      )}
    </section>
  );
};

export default RelatedProducts;
