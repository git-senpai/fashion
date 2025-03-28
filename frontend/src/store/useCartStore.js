import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import * as cartService from "../services/cartService";

// Helper function to check if the user is logged in
const isUserLoggedIn = () => {
  try {
    const authStorage = localStorage.getItem("auth-storage");
    if (!authStorage) return false;

    const parsed = JSON.parse(authStorage);
    if (
      !parsed ||
      !parsed.state ||
      !parsed.state.user ||
      !parsed.state.user.token
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error checking if user is logged in:", error);
    return false;
  }
};

// Helper function to calculate cart totals
const calculateCartTotals = (items) => {
  const itemsCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );
  const tax = subtotal * 0.1; // Assuming 10% tax
  const shippingPrice = subtotal > 100 ? 0 : 10; // Free shipping over $100
  const total = subtotal + tax + shippingPrice;

  return {
    itemsCount,
    subtotal,
    tax,
    shippingPrice,
    total,
  };
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      loading: false,
      error: null,
      ...calculateCartTotals([]), // Initialize with empty cart

      // Initialize cart from backend if user is logged in
      initCart: async () => {
        // Only initialize if user is logged in
        if (!isUserLoggedIn()) {
          return;
        }

        set({ loading: true, error: null });
        try {
          const cartItems = await cartService.getCart();
          set({
            cartItems,
            ...calculateCartTotals(cartItems),
            loading: false,
          });
        } catch (error) {
          console.error("Failed to initialize cart:", error);
          set({
            error: error.message || "Failed to load cart",
            loading: false,
          });
          toast.error(error.message || "Failed to load your cart");
        }
      },

      // Add item to cart
      addToCart: async (product, quantity = 1) => {
        try {
          set({ loading: true, error: null });

          // Parse quantity to ensure it's a number
          const parsedQuantity = parseInt(quantity);
          if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            throw new Error("Invalid quantity");
          }

          if (isUserLoggedIn()) {
            // User is logged in, sync with server
            const cartItems = await cartService.addToCart(
              product._id,
              parsedQuantity
            );
            set({
              cartItems,
              ...calculateCartTotals(cartItems),
              loading: false,
            });
          } else {
            // User is not logged in, update local state
            const { cartItems } = get();

            // Check if product already exists in cart
            const existingItem = cartItems.find(
              (item) => item._id === product._id
            );

            let updatedCart;
            if (existingItem) {
              // Update quantity if product exists
              updatedCart = cartItems.map((item) =>
                item._id === product._id
                  ? { ...item, quantity: item.quantity + parsedQuantity }
                  : item
              );
            } else {
              // Add new item if product doesn't exist
              const newItem = {
                _id: product._id,
                name: product.name,
                image:
                  product.image ||
                  product.images?.[0] ||
                  "https://placehold.co/100x100?text=No+Image",
                price: product.price,
                countInStock: product.countInStock,
                quantity: parsedQuantity,
              };
              updatedCart = [...cartItems, newItem];
            }

            set({
              cartItems: updatedCart,
              ...calculateCartTotals(updatedCart),
              loading: false,
            });
          }

          toast.success(`${product.name} added to cart`);
        } catch (error) {
          console.error("Failed to add to cart:", error);
          set({
            error: error.message || "Failed to add to cart",
            loading: false,
          });
          toast.error(error.message || "Failed to add to cart");
        }
      },

      // Update cart item quantity
      updateCartItemQuantity: async (productId, quantity) => {
        try {
          // Parse quantity to ensure it's a number
          const parsedQuantity = parseInt(quantity);
          if (isNaN(parsedQuantity) || parsedQuantity < 1) {
            throw new Error("Invalid quantity");
          }

          set({ loading: true, error: null });

          if (isUserLoggedIn()) {
            // User is logged in, sync with server
            const cartItems = await cartService.updateCartItem(
              productId,
              parsedQuantity
            );
            set({
              cartItems,
              ...calculateCartTotals(cartItems),
              loading: false,
            });
          } else {
            // User is not logged in, update local state
            const { cartItems } = get();
            const updatedCart = cartItems.map((item) =>
              item._id === productId
                ? { ...item, quantity: parsedQuantity }
                : item
            );

            set({
              cartItems: updatedCart,
              ...calculateCartTotals(updatedCart),
              loading: false,
            });
          }

          toast.success("Cart updated");
        } catch (error) {
          console.error("Failed to update cart:", error);
          set({
            error: error.message || "Failed to update cart",
            loading: false,
          });
          toast.error(error.message || "Failed to update cart");
        }
      },

      // Remove item from cart
      removeFromCart: async (productId) => {
        try {
          set({ loading: true, error: null });

          if (isUserLoggedIn()) {
            // User is logged in, sync with server
            const cartItems = await cartService.removeFromCart(productId);
            set({
              cartItems,
              ...calculateCartTotals(cartItems),
              loading: false,
            });
          } else {
            // User is not logged in, update local state
            const { cartItems } = get();
            const updatedCart = cartItems.filter(
              (item) => item._id !== productId
            );

            set({
              cartItems: updatedCart,
              ...calculateCartTotals(updatedCart),
              loading: false,
            });
          }

          toast.success("Item removed from cart");
        } catch (error) {
          console.error("Failed to remove from cart:", error);
          set({
            error: error.message || "Failed to remove from cart",
            loading: false,
          });
          toast.error(error.message || "Failed to remove from cart");
        }
      },

      // Clear cart
      clearCart: async () => {
        try {
          set({ loading: true, error: null });

          if (isUserLoggedIn()) {
            // User is logged in, sync with server
            await cartService.clearCart();
          }

          set({
            cartItems: [],
            ...calculateCartTotals([]),
            loading: false,
          });

          toast.success("Cart cleared");
        } catch (error) {
          console.error("Failed to clear cart:", error);
          set({
            error: error.message || "Failed to clear cart",
            loading: false,
          });
          toast.error(error.message || "Failed to clear cart");
        }
      },

      // Sync local cart with server after login
      syncCartWithServer: async () => {
        if (!isUserLoggedIn()) return;

        const { cartItems } = get();
        if (cartItems.length === 0) {
          // If local cart is empty, just load from server
          get().initCart();
          return;
        }

        set({ loading: true, error: null });
        try {
          const updatedCartItems = await cartService.syncCart(cartItems);
          set({
            cartItems: updatedCartItems,
            ...calculateCartTotals(updatedCartItems),
            loading: false,
          });
          toast.success("Cart synced with your account");
        } catch (error) {
          console.error("Failed to sync cart:", error);
          set({
            error: error.message || "Failed to sync cart",
            loading: false,
          });
          toast.error(error.message || "Failed to sync your cart");
        }
      },
    }),
    {
      name: "cart-storage",
      // When loading persisted state, calculate totals
      onRehydrateStorage: () => (state) => {
        if (state && state.cartItems) {
          state.initCart();
        }
      },
    }
  )
);
