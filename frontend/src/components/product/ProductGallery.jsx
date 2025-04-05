import { useState } from "react";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";

const ProductGallery = ({ images = [], productName = "Product" }) => {
  const [currentImage, setCurrentImage] = useState(0);

  // Use provided images or fallback to placeholder
  const productImages =
    images.length > 0 ? images : ["https://placehold.co/600x400?text=No+Image"];

  const nextImage = () => {
    if (productImages.length > 1) {
      setCurrentImage((prev) =>
        prev === productImages.length - 1 ? 0 : prev + 1
      );
    }
  };

  const prevImage = () => {
    if (productImages.length > 1) {
      setCurrentImage((prev) =>
        prev === 0 ? productImages.length - 1 : prev - 1
      );
    }
  };

  return (
    <div>
      <div className="relative mb-4 overflow-hidden rounded-lg bg-gray-100">
        <img
          src={productImages[currentImage]}
          alt={productName}
          className="h-[400px] w-full object-cover object-center"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "https://placehold.co/600x400?text=Image+Not+Found";
          }}
        />

        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 p-2 shadow-md transition-all hover:bg-white"
              aria-label="Next image"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail Images */}
      {productImages.length > 1 && (
        <div className="grid grid-cols-4 gap-2">
          {productImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`overflow-hidden rounded-md border-2 ${
                currentImage === index ? "border-primary" : "border-transparent"
              }`}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="h-20 w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200?text=Thumbnail";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
