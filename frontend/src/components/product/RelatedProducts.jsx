import { useEffect, useState } from "react";
import { ProductCard } from "../ProductCard";
import { getProducts } from "../../services/productService";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const RelatedProducts = ({ productId, category }) => {
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!category) return;

      try {
        setLoading(true);
        // Query products by category
        const result = await getProducts("", "", category);

        // Filter out the current product and limit to 4 related products
        const filtered = result.products
          .filter((prod) => prod._id !== productId)
          .slice(0, 4);

        setRelatedProducts(filtered);
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [productId, category]);

  if (!category) return null;

  return (
    <div className="mt-16">
      <h2 className="mb-6 text-2xl font-bold">Related Products</h2>

      {loading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} height={350} className="rounded-lg" />
          ))}
        </div>
      ) : relatedProducts.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((relatedProduct) => (
            <ProductCard key={relatedProduct._id} product={relatedProduct} />
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">
          No related products found.
        </p>
      )}
    </div>
  );
};

export default RelatedProducts;
