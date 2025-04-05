import { useState } from "react";
import ProductReviews from "./ProductReviews";

const ProductTabs = ({ product, user, isAuthenticated, onReviewSubmitted }) => {
  const [activeTab, setActiveTab] = useState("description");

  return (
    <div>
      <div className="mb-4 border-b border-border">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab("description")}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === "description"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Description
          </button>
          <button
            onClick={() => setActiveTab("specifications")}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === "specifications"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`border-b-2 pb-2 text-sm font-medium ${
              activeTab === "reviews"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground"
            }`}
          >
            Reviews ({product?.numReviews || 0})
          </button>
        </div>
      </div>

      <div className="pb-6">
        {activeTab === "description" && (
          <div className="prose max-w-none text-sm">
            <p>{product?.description || "No description available."}</p>
          </div>
        )}

        {activeTab === "specifications" && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">Brand</span>
              <span>{product?.brand || "N/A"}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm">
              <span className="font-medium">Category</span>
              <span>{product?.category || "N/A"}</span>
            </div>

            {/* Display available sizes and their stock */}
            {product?.sizeQuantities && product.sizeQuantities.length > 0 && (
              <div className="rounded-md bg-muted p-3">
                <span className="block font-medium mb-2">Available Sizes</span>
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {product.sizeQuantities
                    .filter((sq) => sq.quantity > 0)
                    .map((sq) => (
                      <div
                        key={sq.size}
                        className="text-center rounded bg-white p-1.5 border border-gray-200"
                      >
                        <span className="block font-medium">{sq.size}</span>
                        <span className="text-xs text-muted-foreground">
                          {sq.quantity} in stock
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {product?.specifications?.map((spec, index) => (
              <div
                key={index}
                className="grid grid-cols-2 gap-2 rounded-md bg-muted p-3 text-sm"
              >
                <span className="font-medium">{spec.name}</span>
                <span>{spec.value}</span>
              </div>
            ))}
          </div>
        )}

        {activeTab === "reviews" && (
          <ProductReviews
            product={product}
            user={user}
            isAuthenticated={isAuthenticated}
            onReviewSubmitted={onReviewSubmitted}
          />
        )}
      </div>
    </div>
  );
};

export default ProductTabs;
