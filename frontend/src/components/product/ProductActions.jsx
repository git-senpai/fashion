import { useState } from "react";
import { FiShoppingCart, FiHeart } from "react-icons/fi";
import { toast } from "sonner";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { useCartStore } from "../../store/useCartStore";
import { useNavigate } from "react-router-dom";

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
    <div className="mb-8 flex flex-wrap items-center gap-4">
      <div className="w-24">
        <Input
          type="number"
          value={quantity}
          onChange={handleQuantityChange}
          min={1}
          max={product?.countInStock || 1}
          disabled={!product || product.countInStock === 0}
          aria-label="Quantity"
        />
      </div>
      <Button
        onClick={handleAddToCart}
        disabled={!product || product.countInStock === 0 || addingToCart}
        className="flex items-center gap-2"
      >
        {addingToCart ? (
          <>
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-t-transparent"></div>
            Adding...
          </>
        ) : (
          <>
            <FiShoppingCart className="h-4 w-4" />
            Add to Cart
          </>
        )}
      </Button>
      <Button
        variant="outline"
        className="flex items-center gap-2"
        onClick={handleWishlistClick}
      >
        <FiHeart
          className={`h-4 w-4 ${
            productInWishlist ? "fill-red-500 text-red-500" : ""
          }`}
        />
        {productInWishlist ? "Remove from Wishlist" : "Add to Wishlist"}
      </Button>
    </div>
  );
};

export default ProductActions;
