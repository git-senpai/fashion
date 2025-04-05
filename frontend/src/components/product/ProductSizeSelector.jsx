const ProductSizeSelector = ({
  sizeQuantities = [],
  selectedSize,
  onSelectSize,
}) => {
  if (!sizeQuantities || sizeQuantities.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h3 className="mb-2 text-sm font-medium">Select Size</h3>
      <div className="flex flex-wrap gap-2">
        {sizeQuantities.map((sizeQty) => (
          <button
            key={sizeQty.size}
            type="button"
            onClick={() => onSelectSize(sizeQty.size)}
            disabled={sizeQty.quantity === 0}
            className={`flex h-10 min-w-[3rem] items-center justify-center rounded-md border px-3 transition-colors ${
              selectedSize === sizeQty.size
                ? "border-primary bg-primary/10 font-medium text-primary"
                : sizeQty.quantity === 0
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            {sizeQty.size}
            {sizeQty.quantity === 0 && (
              <span className="ml-1">(Out of stock)</span>
            )}
          </button>
        ))}
      </div>
      {selectedSize && (
        <p className="mt-2 text-sm text-muted-foreground">
          {sizeQuantities.find((sq) => sq.size === selectedSize)?.quantity || 0}{" "}
          items available in size {selectedSize}
        </p>
      )}
    </div>
  );
};

export default ProductSizeSelector;
