import { FiStar, FiPackage, FiCheck } from "react-icons/fi";

// Helper functions for price calculations
const calculateOriginalPrice = (price, discount) => {
  if (discount > 0) {
    return price / (1 - discount / 100);
  }
  return price;
};

const calculateSavings = (price, discount) => {
  if (discount > 0) {
    const originalPrice = calculateOriginalPrice(price, discount);
    return originalPrice - price;
  }
  return 0;
};

const ProductInfo = ({ product }) => {
  if (!product) return null;

  const {
    name,
    brand,
    rating = 0,
    numReviews = 0,
    price = 0,
    discountPercentage = 0,
    countInStock = 0,
  } = product;

  return (
    <div>
      {/* Brand (if available) */}
      {brand && (
        <div className="mb-2">
          <span className="text-sm font-medium uppercase tracking-wider text-gray-500">
            {brand}
          </span>
        </div>
      )}

      {/* Product Name */}
      <h1 className="mb-3 text-2xl font-bold text-gray-800 sm:text-3xl">
        {name}
      </h1>

      {/* Rating */}
      <div className="mb-5 flex items-center">
        <div className="flex items-center">
          {Array(5)
            .fill()
            .map((_, index) => (
              <FiStar
                key={index}
                className={`h-4 w-4 ${
                  index < Math.round(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                }`}
              />
            ))}
        </div>
        <span className="ml-2 text-sm text-gray-500">
          {rating.toFixed(1)} • {numReviews}{" "}
          {numReviews === 1 ? "review" : "reviews"}
        </span>
      </div>

      {/* Price */}
      <div className="mb-6 rounded-lg bg-gray-50 p-4">
        <div className="flex flex-wrap items-center gap-2">
          {discountPercentage > 0 ? (
            <>
              <span className="text-2xl font-bold text-primary">
                ${price.toFixed(2)}
              </span>
              <span className="text-lg text-gray-400 line-through">
                ${calculateOriginalPrice(price, discountPercentage).toFixed(2)}
              </span>
              <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                {discountPercentage}% OFF
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold text-gray-800">
              ${price.toFixed(2)}
            </span>
          )}
        </div>
        {discountPercentage > 0 && (
          <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
            <FiCheck className="h-4 w-4" />
            <span>
              You save ${calculateSavings(price, discountPercentage).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Stock Status */}
      <div className="mb-6 flex items-center gap-2">
        <FiPackage
          className={countInStock > 0 ? "text-green-500" : "text-red-500"}
        />
        <span
          className={`text-sm font-medium ${
            countInStock > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {countInStock > 0
            ? `In Stock (${countInStock} available)`
            : "Out of Stock"}
        </span>
      </div>
    </div>
  );
};

export default ProductInfo;
