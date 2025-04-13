import { useState } from "react";
import { FiShoppingCart, FiHeart, FiMinus, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const ProductActions = ({
  product,
  selectedSize,
  productInWishlist,
  onToggleWishlist,
  isAuthenticated,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const { addToCart } = useCartStore();
  const navigate = useNavigate();

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value > 0 && value <= (product?.countInStock || 1)) {
      setQuantity(value);
    }
  };

  const incrementQuantity = () => {
    if (quantity < (product?.countInStock || 1)) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleAddToCart = async () => {
    try {
      if (!product) return;

      if (product.countInStock === 0) {
        toast.error("This product is out of stock");
        return;
      }

      if (
        product.sizeQuantities &&
        product.sizeQuantities.length > 0 &&
        !selectedSize
      ) {
        toast.error("Please select a size");
        return;
      }

      // Check if the selected size has enough stock
      if (selectedSize) {
        const sizeInfo = product.sizeQuantities.find(
          (sq) => sq.size === selectedSize
        );
        if (!sizeInfo) {
          toast.error("Selected size not found");
          return;
        }

        if (sizeInfo.quantity < quantity) {
          toast.error(
            `Only ${sizeInfo.quantity} items available for size ${selectedSize}`
          );
          return;
        }
      }

      setAddingToCart(true);

      // Use the first product image or a placeholder
      const productImage =
        product.images?.[0] ||
        product.image ||
        "https://placehold.co/600x400?text=No+Image";

      // Create cart item object
      const cartItem = {
        productId: product._id,
        name: product.name,
        image: productImage,
        price: product.price,
        countInStock: product.countInStock,
        quantity,
        size: selectedSize || null,
      };

      await addToCart(cartItem);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      console.error("Error adding to cart:", error);
      toast.error(error.message || "Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  const handleWishlistClick = async () => {
    if (!isAuthenticated) {
      toast.error("Please log in to add items to your wishlist");
      navigate(`/login?redirect=products/${product._id}`);
      return;
    }

    onToggleWishlist();
  };

  return (
    <div className="mb-8 space-y-5">
      {/* Quantity Selector */}
      <div className="flex items-center">
        <label className="mr-3 font-medium text-gray-700">Quantity:</label>
        <div className="flex items-center">
          <button
            onClick={decrementQuantity}
            disabled={quantity <= 1}
            className={`flex h-10 w-10 items-center justify-center rounded-l-lg border ${
              quantity <= 1
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="Decrease quantity"
          >
            <FiMinus className="h-4 w-4" />
          </button>

          <Input
            type="number"
            value={quantity}
            onChange={handleQuantityChange}
            min={1}
            max={product?.countInStock || 1}
            disabled={!product || product.countInStock === 0}
            className="h-10 w-16 rounded-none border-x-0 border-gray-300 text-center"
            aria-label="Quantity"
          />

          <button
            onClick={incrementQuantity}
            disabled={quantity >= (product?.countInStock || 1)}
            className={`flex h-10 w-10 items-center justify-center rounded-r-lg border ${
              quantity >= (product?.countInStock || 1)
                ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                : "border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
            aria-label="Increase quantity"
          >
            <FiPlus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleAddToCart}
          disabled={!product || product.countInStock === 0 || addingToCart}
          className={`flex flex-1 items-center justify-center rounded-xl bg-primary px-8 py-3.5 font-semibold text-white shadow-sm transition-colors ${
            !product || product.countInStock === 0 || addingToCart
              ? "cursor-not-allowed opacity-70"
              : "hover:bg-primary/90"
          }`}
        >
          {addingToCart ? (
            <>
              <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              Adding to Cart...
            </>
          ) : (
            <>
              <FiShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </>
          )}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWishlistClick}
          className={`flex items-center justify-center rounded-xl px-8 py-3.5 font-semibold shadow-sm transition-all ${
            productInWishlist
              ? "border border-red-200 bg-red-50 text-red-600 hover:bg-red-100"
              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
          }`}
        >
          <FiHeart
            className={`mr-2 h-5 w-5 ${
              productInWishlist ? "fill-red-500 text-red-500" : ""
            }`}
          />
          {productInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
        </motion.button>
      </div>
    </div>
  );
};

export default ProductActions;
