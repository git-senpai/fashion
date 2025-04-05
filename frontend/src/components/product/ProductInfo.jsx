import { FiStar } from "react-icons/fi";

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
    rating = 0,
    numReviews = 0,
    price = 0,
    discountPercentage = 0,
    countInStock = 0,
  } = product;

  return (
    <div>
      <h1 className="mb-2 text-3xl font-bold">{name}</h1>

      {/* Rating */}
      <div className="mb-4 flex items-center">
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
        <span className="ml-2 text-sm text-muted-foreground">
          {rating.toFixed(1)} ({numReviews} reviews)
        </span>
      </div>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-center gap-2">
          {discountPercentage > 0 ? (
            <>
              <span className="text-2xl font-bold text-[#e84a7f]">
                ${price.toFixed(2)}
              </span>
              <span className="text-lg text-muted-foreground line-through">
                ${calculateOriginalPrice(price, discountPercentage).toFixed(2)}
              </span>
              <span className="rounded-md bg-green-100 px-2 py-1 text-xs font-medium text-green-800">
                {discountPercentage}% OFF
              </span>
            </>
          ) : (
            <span className="text-2xl font-bold">${price.toFixed(2)}</span>
          )}
        </div>
        {discountPercentage > 0 && (
          <div className="mt-1 text-sm text-green-600">
            You save: ${calculateSavings(price, discountPercentage).toFixed(2)}
          </div>
        )}
      </div>

      {/* Stock Status */}
      <div className="mb-6">
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
