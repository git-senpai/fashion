import { create } from "zustand";
import { persist } from "zustand/middleware";
import { toast } from "sonner";
import * as wishlistService from "../services/wishlistService";

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

export const useWishlistStore = create(
  persist(
    (set, get) => ({
      wishlistItems: [],
      loading: false,
      error: null,

      // Initialize wishlist from backend
      initWishlist: async () => {
        // Only initialize if user is logged in
        if (!isUserLoggedIn()) {
          set({ wishlistItems: [], loading: false, error: null });
          return;
        }

        set({ loading: true, error: null });
        try {
          const wishlistItems = await wishlistService.getWishlist();
          console.log("Wishlist items from API:", wishlistItems);
          set({ wishlistItems, loading: false });
        } catch (error) {
          console.error("Failed to initialize wishlist:", error);
          set({
            error: error.message || "Failed to load wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to load your wishlist");
        }
      },

      // Add to wishlist
      addToWishlist: async (product) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to add items to your wishlist");
          return;
        }

        try {
          set({ loading: true, error: null });

          // Extract the product ID - we don't need to send the whole product
          const productId = product._id;

          if (!productId) {
            throw new Error("Invalid product");
          }

          const wishlistItems = await wishlistService.addToWishlist(productId);
          set({ wishlistItems, loading: false });
          toast.success(`${product.name} added to wishlist`);
        } catch (error) {
          console.error("Failed to add to wishlist:", error);
          set({
            error: error.message || "Failed to add to wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to add to wishlist");
        }
      },

      // Remove from wishlist
      removeFromWishlist: async (productId) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist");
          return;
        }

        try {
          set({ loading: true, error: null });
          const wishlistItems = await wishlistService.removeFromWishlist(
            productId
          );
          set({ wishlistItems, loading: false });
          toast.success("Item removed from wishlist");
        } catch (error) {
          console.error("Failed to remove from wishlist:", error);
          set({
            error: error.message || "Failed to remove from wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to remove from wishlist");
        }
      },

      // Clear wishlist
      clearWishlist: async () => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist");
          return;
        }

        try {
          set({ loading: true, error: null });
          await wishlistService.clearWishlist();
          set({ wishlistItems: [], loading: false });
          toast.success("Wishlist cleared");
        } catch (error) {
          console.error("Failed to clear wishlist:", error);
          set({
            error: error.message || "Failed to clear wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to clear wishlist");
        }
      },

      // Check if a product is in the wishlist
      isInWishlist: (productId) => {
        return get().wishlistItems.some(
          (item) => item._id === productId || item.toString() === productId
        );
      },
    }),
    {
      name: "wishlist-storage",
      // When loading persisted state, check if user is logged in and load from server if they are
      onRehydrateStorage: () => (state) => {
        if (state && isUserLoggedIn()) {
          state.initWishlist();
        }
      },
    }
  )
);
