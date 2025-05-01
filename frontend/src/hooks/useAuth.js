import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { toast } from "sonner";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      loading: false,
      error: null,

      // Login user
      login: async (email, password) => {
        try {
          set({ loading: true, error: null });
          const { data } = await axios.post("/api/users/login", {
            email,
            password,
          });

          // Make sure isAdmin is properly set
          const userData = {
            ...data,
            isAdmin: data.isAdmin === true, // Ensure boolean type
          };

          console.log("User data after login:", userData);
          set({ user: userData, loading: false });
          toast.success("Login successful");

          // Sync cart and wishlist after login
          setTimeout(() => {
            useCartStore.getState().syncCartWithServer();
            useWishlistStore.getState().initWishlist();
          }, 500);

          return userData;
        } catch (error) {
          const message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          set({ error: message, loading: false });
          toast.error(message);
          throw error;
        }
      },

      // Register user
      register: async (name, email, password) => {
        try {
          set({ loading: true, error: null });
          const { data } = await axios.post("/api/users", {
            name,
            email,
            password,
          });
          set({ user: data, loading: false });
          toast.success("Registration successful");

          // Sync cart and wishlist after registration
          setTimeout(() => {
            useCartStore.getState().syncCartWithServer();
            useWishlistStore.getState().initWishlist();
          }, 500);

          return data;
        } catch (error) {
          const message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          set({ error: message, loading: false });
          toast.error(message);
          throw error;
        }
      },

      // Logout user
      logout: () => {
        set({ user: null });
        //refresh the page
        window.location.reload();
        //clear the local storage
        localStorage.clear();
        toast.success("Logged out successfully");
      },

      // Update user profile
      updateProfile: async (userData) => {
        try {
          set({ loading: true, error: null });
          const config = {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userData.token}`,
            },
          };
          const { data } = await axios.put(
            "/api/users/profile",
            userData,
            config
          );
          set({ user: data, loading: false });
          toast.success("Profile updated successfully");
          return data;
        } catch (error) {
          const message =
            error.response && error.response.data.message
              ? error.response.data.message
              : error.message;
          set({ error: message, loading: false });
          toast.error(message);
          throw error;
        }
      },

      // Check if user is authenticated
      isAuthenticated: () => {
        return !!useAuthStore.getState().user;
      },

      // Check if user is admin
      isAdmin: () => {
        const user = useAuthStore.getState().user;
        return user && user.isAdmin;
      },
    }),
    {
      name: "auth-storage", // unique name
      getStorage: () => localStorage, // define which storage to use
    }
  )
);

export const useAuth = () => {
  const store = useAuthStore();
  return {
    ...store,
    isAuthenticated: !!store.user,
    isAdmin: store.user?.isAdmin === true,
  };
};
