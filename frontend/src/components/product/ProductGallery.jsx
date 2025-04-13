import { useState } from "react";
import { FiChevronRight, FiChevronLeft, FiZoomIn } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ProductGallery = ({ images = [], productName = "Product" }) => {
  const [currentImage, setCurrentImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);

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

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  return (
    <div>
      {/* Main Image Container */}
      <div className="relative mb-5 overflow-hidden rounded-xl bg-gray-50">
        <div
          className={`relative ${
            isZoomed ? "cursor-zoom-out" : "cursor-zoom-in"
          }`}
          onClick={toggleZoom}
        >
          <motion.img
            src={productImages[currentImage]}
            alt={productName}
            className={`h-[450px] w-full object-contain transition-all duration-300 sm:h-[500px] ${
              isZoomed ? "scale-150" : "scale-100"
            }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/600x400?text=Image+Not+Found";
            }}
          />

          {/* Zoom Icon */}
          {!isZoomed && (
            <div className="absolute bottom-3 right-3 rounded-full bg-white/80 p-2 shadow-sm">
              <FiZoomIn className="h-4 w-4 text-gray-700" />
            </div>
          )}
        </div>

        {/* Navigation Arrows */}
        {productImages.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition-all hover:bg-white hover:shadow-lg"
              aria-label="Previous image"
            >
              <FiChevronLeft className="h-5 w-5 text-gray-700" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2.5 shadow-md transition-all hover:bg-white hover:shadow-lg"
              aria-label="Next image"
            >
              <FiChevronRight className="h-5 w-5 text-gray-700" />
            </button>
          </>
        )}

        {/* Image Indicator */}
        {productImages.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="flex gap-1.5 rounded-full bg-black/20 px-3 py-1.5 backdrop-blur-sm">
              {productImages.map((_, index) => (
                <button
                  key={index}
                  className={`h-2 w-2 rounded-full ${
                    currentImage === index ? "bg-white" : "bg-white/50"
                  }`}
                  onClick={() => setCurrentImage(index)}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Thumbnail Images */}
      {productImages.length > 1 && (
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {productImages.map((image, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentImage(index)}
              className={`overflow-hidden rounded-lg transition-all ${
                currentImage === index
                  ? "ring-2 ring-primary ring-offset-2"
                  : "border border-gray-200 opacity-70 hover:opacity-100"
              }`}
              whileHover={{ scale: 1.05 }}
              aria-label={`View image ${index + 1}`}
            >
              <img
                src={image}
                alt={`${productName} ${index + 1}`}
                className="aspect-square w-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "https://placehold.co/300x200?text=Thumbnail";
                }}
              />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
