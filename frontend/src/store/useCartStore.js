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
    if (!parsed || !parsed.user || !parsed.user.token) return false;

    return true;
  } catch (error) {
    console.error("Error checking if user is logged in:", error);
    return false;
  }
};

export const useCartStore = create(
  persist(
    (set, get) => ({
      cartItems: [],
      shippingAddress: {},
      paymentMethod: "",
      isLoading: false,
      error: null,

      // Initialize cart from backend if user is logged in
      initCart: async () => {
        set({ isLoading: true, error: null });

        // If user is not logged in, just keep local cart
        if (!isUserLoggedIn()) {
          console.log("User not logged in, keeping local cart");
          set({ isLoading: false });
          return;
        }

        try {
          console.log("Fetching cart from server for logged-in user");
          const cartItems = await cartService.getCart();

          // Log cart items for debugging
          console.log("Cart items received from server:", cartItems);

          // Only update state if we got a valid response
          if (Array.isArray(cartItems)) {
            set({ cartItems, isLoading: false });
          } else {
            console.error("Invalid cart data received:", cartItems);
            set({
              error: "Received invalid cart data from server",
              isLoading: false,
            });
          }
        } catch (error) {
          console.error("Failed to initialize cart:", error);

          // Show error toast
          toast.error(error.message || "Failed to load your cart");

          set({
            error: error.message || "Failed to load cart",
            isLoading: false,
          });
        }
      },

      // Add to cart
      addToCart: async (product, quantity = 1) => {
        const cartItems = get().cartItems;
        const existItem = cartItems.find((item) => item._id === product._id);

        // Update local state first for immediate UI feedback
        if (existItem) {
          const updatedCartItems = cartItems.map((item) =>
            item._id === existItem._id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
          set({ cartItems: updatedCartItems });
        } else {
          set({ cartItems: [...cartItems, { ...product, quantity }] });
        }

        // Show success toast
        toast.success(`${product.name} added to cart`);

        // If user is logged in, sync with server
        if (isUserLoggedIn()) {
          try {
            const updatedCartItems = await cartService.addToCart(
              product._id,
              quantity
            );
            set({ cartItems: updatedCartItems });
          } catch (error) {
            console.error("Failed to add to cart on server:", error);
            toast.error("Error syncing with server. Changes saved locally.");
          }
        }
      },

      // Remove from cart
      removeFromCart: async (id) => {
        const cartItems = get().cartItems;
        const updatedCartItems = cartItems.filter((item) => item._id !== id);

        // Update local state first
        set({ cartItems: updatedCartItems });
        toast.success("Item removed from cart");

        // If user is logged in, sync with server
        if (isUserLoggedIn()) {
          try {
            await cartService.removeFromCart(id);
          } catch (error) {
            console.error("Failed to remove from cart on server:", error);
            toast.error("Error syncing with server. Changes saved locally.");
          }
        }
      },

      // Update cart item quantity
      updateCartQuantity: async (id, quantity) => {
        const cartItems = get().cartItems;
        const updatedCartItems = cartItems.map((item) =>
          item._id === id ? { ...item, quantity } : item
        );

        // Update local state first
        set({ cartItems: updatedCartItems });

        // If user is logged in, sync with server
        if (isUserLoggedIn()) {
          try {
            await cartService.updateCartItem(id, quantity);
          } catch (error) {
            console.error("Failed to update cart on server:", error);
            toast.error("Error syncing with server. Changes saved locally.");
          }
        }
      },

      // Save shipping address
      saveShippingAddress: (data) => {
        set({ shippingAddress: data });
      },

      // Save payment method
      savePaymentMethod: (data) => {
        set({ paymentMethod: data });
      },

      // Clear cart
      clearCart: async () => {
        // Update local state first
        set({ cartItems: [] });

        // If user is logged in, sync with server
        if (isUserLoggedIn()) {
          try {
            await cartService.clearCart();
          } catch (error) {
            console.error("Failed to clear cart on server:", error);
            toast.error("Error syncing with server. Cart cleared locally.");
          }
        }
      },

      // Sync local cart with server after login
      syncCartWithServer: async () => {
        if (!isUserLoggedIn()) return;

        const cartItems = get().cartItems;
        if (cartItems.length === 0) {
          // If local cart is empty, fetch from server
          get().initCart();
          return;
        }

        // If local cart has items, sync with server
        try {
          set({ isLoading: true, error: null });
          const result = await cartService.syncCart(cartItems);

          // Handle validation results
          if (result.validationSummary) {
            const { outOfStock, nonExistent, quantityAdjusted, otherIssues } =
              result.validationSummary;

            // Show appropriate notifications
            if (nonExistent && nonExistent.length > 0) {
              toast.error(
                `${nonExistent.length} item${
                  nonExistent.length > 1 ? "s" : ""
                } in your cart no longer exist${
                  nonExistent.length > 1 ? "" : "s"
                } and ${nonExistent.length > 1 ? "have" : "has"} been removed.`,
                { duration: 5000 }
              );
            }

            if (outOfStock && outOfStock.length > 0) {
              toast.error(
                `${outOfStock.length} item${
                  outOfStock.length > 1 ? "s are" : " is"
                } out of stock and ${
                  outOfStock.length > 1 ? "have" : "has"
                } been removed from your cart.`,
                { duration: 5000 }
              );
            }

            if (quantityAdjusted && quantityAdjusted.length > 0) {
              toast.warning(
                `Quantities have been adjusted for ${
                  quantityAdjusted.length
                } item${
                  quantityAdjusted.length > 1 ? "s" : ""
                } due to stock limitations.`,
                { duration: 5000 }
              );
            }

            if (otherIssues && otherIssues.length > 0) {
              toast.warning(
                "Some items in your cart could not be synced properly.",
                { duration: 4000 }
              );
            }

            set({ cartItems: result.cartItems, isLoading: false });
          } else {
            // No validation issues
            set({ cartItems: result, isLoading: false });
            toast.success("Cart synced with your account");
          }
        } catch (error) {
          console.error("Failed to sync cart with server:", error);
          set({
            error: error.message || "Error syncing cart with server",
            isLoading: false,
          });
          toast.error(error.message || "Error syncing cart with server");
        }
      },

      // Calculate totals
      getTotals: () => {
        const cartItems = get().cartItems;
        const itemsCount = cartItems.reduce(
          (acc, item) => acc + item.quantity,
          0
        );
        const subtotal = cartItems.reduce(
          (acc, item) => acc + item.quantity * item.price,
          0
        );
        const shipping = subtotal > 100 ? 0 : 10;
        const tax = Number((subtotal * 0.15).toFixed(2));
        const total = subtotal + shipping + tax;

        return {
          itemsCount,
          subtotal,
          shipping,
          tax,
          total,
        };
      },
    }),
    {
      name: "shopping-cart", // unique name
      getStorage: () => localStorage, // define which storage to use
    }
  )
);
