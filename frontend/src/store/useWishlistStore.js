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
      collections: [],
      activeCollection: "all", // "all" or collection ID
      loading: false,
      collectionsLoading: false,
      error: null,
      collectionsError: null,

      // Initialize wishlist from backend
      initWishlist: async () => {
        // Only initialize if user is logged in
        if (!isUserLoggedIn()) {
          set({ 
            wishlistItems: [], 
            collections: [],
            loading: false, 
            collectionsLoading: false,
            error: null,
            collectionsError: null 
          });
          return;
        }

        set({ loading: true, error: null });
        try {
          const wishlistItems = await wishlistService.getWishlist();
          console.log("Wishlist items from API:", wishlistItems);
          set({ wishlistItems, loading: false });
          
          // Also load collections
          get().initCollections();
        } catch (error) {
          console.error("Failed to initialize wishlist:", error);
          set({
            error: error.message || "Failed to load wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to load your wishlist");
        }
      },
      
      // Initialize collections from backend
      initCollections: async () => {
        // Only initialize if user is logged in
        if (!isUserLoggedIn()) {
          set({ collections: [], collectionsLoading: false, collectionsError: null });
          return;
        }

        set({ collectionsLoading: true, collectionsError: null });
        try {
          const collections = await wishlistService.getWishlistCollections();
          console.log("Wishlist collections from API:", collections);
          set({ collections, collectionsLoading: false });
        } catch (error) {
          console.error("Failed to initialize wishlist collections:", error);
          set({
            collectionsError: error.message || "Failed to load wishlist collections",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to load your wishlist collections");
        }
      },

      // Set active collection
      setActiveCollection: (collectionId) => {
        set({ activeCollection: collectionId });
      },
      
      // Get items for the active collection
      getActiveCollectionItems: () => {
        const { activeCollection, wishlistItems, collections } = get();
        
        if (activeCollection === "all") {
          // For "all" view, combine main wishlist and all collections
          const collectionItems = collections.flatMap(c => c.products);
          const allItems = [...wishlistItems, ...collectionItems];
          
          // Remove duplicates by ID (if any product appears in both main wishlist and collections)
          const uniqueIds = new Set();
          return allItems.filter(item => {
            const id = item._id || item;
            if (uniqueIds.has(id)) return false;
            uniqueIds.add(id);
            return true;
          });
        }
        
        const collection = collections.find(c => c._id === activeCollection);
        return collection ? collection.products : [];
      },
      
      // Create a new collection
      createCollection: async (name) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist collections");
          return;
        }

        try {
          set({ collectionsLoading: true, collectionsError: null });
          const collections = await wishlistService.createWishlistCollection(name);
          set({ collections, collectionsLoading: false });
          toast.success(`Collection "${name}" created`);
          return collections;
        } catch (error) {
          console.error("Failed to create collection:", error);
          set({
            collectionsError: error.message || "Failed to create collection",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to create collection");
        }
      },
      
      // Delete a collection
      deleteCollection: async (collectionId) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist collections");
          return;
        }

        try {
          set({ collectionsLoading: true, collectionsError: null });
          const collections = await wishlistService.deleteWishlistCollection(collectionId);
          
          // If the deleted collection was active, switch to "all"
          if (get().activeCollection === collectionId) {
            set({ activeCollection: "all" });
          }
          
          set({ collections, collectionsLoading: false });
          toast.success("Collection deleted");
        } catch (error) {
          console.error("Failed to delete collection:", error);
          set({
            collectionsError: error.message || "Failed to delete collection",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to delete collection");
        }
      },
      
      // Add product to collection
      addProductToCollection: async (collectionId, productId) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist collections");
          return;
        }

        try {
          set({ collectionsLoading: true, collectionsError: null });
          const collections = await wishlistService.addProductToCollection(collectionId, productId);
          set({ collections, collectionsLoading: false });
          toast.success("Product added to collection");
        } catch (error) {
          console.error("Failed to add product to collection:", error);
          set({
            collectionsError: error.message || "Failed to add product to collection",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to add product to collection");
        }
      },
      
      // Remove product from collection
      removeProductFromCollection: async (collectionId, productId) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist collections");
          return;
        }

        try {
          set({ collectionsLoading: true, collectionsError: null });
          const collections = await wishlistService.removeProductFromCollection(collectionId, productId);
          set({ collections, collectionsLoading: false });
          toast.success("Product removed from collection");
        } catch (error) {
          console.error("Failed to remove product from collection:", error);
          set({
            collectionsError: error.message || "Failed to remove product from collection",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to remove product from collection");
        }
      },
      
      // Move product between collections
      moveProductBetweenCollections: async (sourceCollectionId, productId, targetCollectionId) => {
        // Check if user is authenticated
        if (!isUserLoggedIn()) {
          toast.error("Please log in to manage your wishlist collections");
          return;
        }

        try {
          set({ collectionsLoading: true, collectionsError: null });
          
          // First, get current product details from the source collection
          let productToMove = null;
          const sourceCollection = get().collections.find(c => c._id === sourceCollectionId);
          
          if (sourceCollection) {
            productToMove = sourceCollection.products.find(p => 
              (p._id && p._id === productId) || 
              (typeof p === 'string' && p === productId)
            );
          }
          
          if (!productToMove) {
            throw new Error("Product not found in source collection");
          }
          
          // Step 1: Add to target collection
          await wishlistService.addProductToCollection(targetCollectionId, productId);
          
          // Step 2: Remove from source collection
          const collections = await wishlistService.removeProductFromCollection(
            sourceCollectionId, 
            productId
          );
          
          set({ collections, collectionsLoading: false });
          toast.success("Product moved to new collection");
          
        } catch (error) {
          console.error("Failed to move product between collections:", error);
          set({
            collectionsError: error.message || "Failed to move product between collections",
            collectionsLoading: false,
          });
          toast.error(error.message || "Failed to move product between collections");
        }
      },

      // Add to wishlist (main or to specific collection)
      addToWishlist: async (product, collectionId = null) => {
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

          const result = await wishlistService.addToWishlist(productId, collectionId);
          
          // Update the appropriate state based on where the product was added
          if (collectionId) {
            set({ collections: result, loading: false });
          } else {
            set({ wishlistItems: result, loading: false });
          }
          
          toast.success(`${product.name} added to wishlist`);
          return result;
        } catch (error) {
          console.error("Failed to add to wishlist:", error);
          set({
            error: error.message || "Failed to add to wishlist",
            loading: false,
          });
          toast.error(error.message || "Failed to add to wishlist");
        }
      },

      // Check if a product is in the wishlist
      isInWishlist: (productId) => {
        const { wishlistItems, collections } = get();
        
        // Check main wishlist
        if (wishlistItems.some(item => 
          (item._id && item._id === productId) || 
          (typeof item === 'string' && item === productId)
        )) {
          return true;
        }
        
        // Check collections
        return collections.some(collection => 
          collection.products.some(item => 
            (item._id && item._id === productId) || 
            (typeof item === 'string' && item === productId)
          )
        );
      },
      
      // Find which collection a product is in (returns collection ID or null if in main wishlist)
      getProductCollectionId: (productId) => {
        const { collections } = get();
        
        for (const collection of collections) {
          if (collection.products.some(item => 
            (item._id && item._id === productId) || 
            (typeof item === 'string' && item === productId)
          )) {
            return collection._id;
          }
        }
        
        return null; // Product is in main wishlist or not found
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
          
          // Check if product is in a collection
          const collectionId = get().getProductCollectionId(productId);
          
          if (collectionId) {
            // Remove from collection
            const collections = await wishlistService.removeProductFromCollection(
              collectionId,
              productId
            );
            set({ collections, loading: false });
          } else {
            // Remove from main wishlist
            const wishlistItems = await wishlistService.removeFromWishlist(
              productId
            );
            set({ wishlistItems, loading: false });
          }
          
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
      
      // Get collection by ID
      getCollectionById: (collectionId) => {
        return get().collections.find(c => c._id === collectionId);
      },
      
      // Check if product is in a specific collection
      isInCollection: (productId, collectionId) => {
        const collection = get().getCollectionById(collectionId);
        if (!collection) return false;
        
        return collection.products.some(item => 
          (item._id && item._id === productId) || 
          item.toString() === productId
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
