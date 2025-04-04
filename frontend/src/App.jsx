import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect } from "react";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import ScrollToTop from "./components/ScrollToTop";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Pages - Lazy loaded
const Home = lazy(() => import("./pages/Home"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetails = lazy(() => import("./pages/ProductDetail"));
const Cart = lazy(() => import("./pages/Cart"));
const StandaloneWishlist = lazy(() => import("./pages/Wishlist"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Protected Dashboard Pages
const UserProfile = lazy(() => import("./pages/dashboard/UserProfile"));
const OrderHistory = lazy(() => import("./pages/dashboard/OrderHistory"));
const Wishlist = lazy(() => import("./pages/dashboard/WishlistPage"));
const Address = lazy(() => import("./pages/dashboard/Address"));

// Admin Pages
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard"));
const AdminProducts = lazy(() => import("./pages/admin/Products"));
const AdminProductEdit = lazy(() => import("./pages/admin/ProductEdit"));
const AdminOrders = lazy(() => import("./pages/admin/Orders"));
const AdminUsers = lazy(() => import("./pages/admin/Users"));
const AdminCategories = lazy(() => import("./pages/admin/CategoryList"));
const AdminCategoryEdit = lazy(() => import("./pages/admin/CategoryEdit"));
const AdminSizes = lazy(() => import("./pages/admin/SizeList"));

function AppContent() {
  const initCart = useCartStore((state) => state.initCart);
  const initWishlist = useWishlistStore((state) => state.initWishlist);

  // Initialize cart and wishlist when app loads
  useEffect(() => {
    initCart();
    initWishlist();
  }, [initCart, initWishlist]);

  return (
    <Suspense
      fallback={
        <div className="h-screen w-full flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Routes>
        {/* Main routes */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetails />} />
          <Route path="cart" element={<Cart />} />
          <Route path="wishlist" element={<StandaloneWishlist />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
        </Route>

        {/* User dashboard routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route path="profile" element={<UserProfile />} />
          <Route path="orders" element={<OrderHistory />} />
          <Route path="wishlist" element={<Wishlist />} />
          <Route path="address" element={<Address />} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/:id" element={<AdminProductEdit />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/new" element={<AdminCategoryEdit />} />
          <Route path="categories/:id/edit" element={<AdminCategoryEdit />} />
          <Route path="sizes" element={<AdminSizes />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        {/* 404 route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster position="top-center" richColors />
      <AppContent />
    </Router>
  );
}

export default App;
