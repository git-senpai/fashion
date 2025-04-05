import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { lazy, Suspense, useEffect } from "react";
import { useCartStore } from "./store/useCartStore";
import { useWishlistStore } from "./store/useWishlistStore";
import ScrollToTop from "./components/ScrollToTop";
import ErrorBoundary from "./components/ErrorBoundary";

// Layouts
import MainLayout from "./layouts/MainLayout";
import AdminLayout from "./layouts/AdminLayout";
import DashboardLayout from "./layouts/DashboardLayout";

// Loading Fallback
const LoadingFallback = () => (
  <div className="h-screen w-full flex items-center justify-center">
    <div className="animate-spin h-10 w-10 border-4 border-[#e84a7f] border-t-transparent rounded-full"></div>
  </div>
);

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

// Wrapper component for lazy loading with error boundary
const LazyComponent = ({ component: Component, ...props }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoadingFallback />}>
      <Component {...props} />
    </Suspense>
  </ErrorBoundary>
);

function AppContent() {
  const initCart = useCartStore((state) => state.initCart);
  const initWishlist = useWishlistStore((state) => state.initWishlist);

  // Initialize cart and wishlist when app loads
  useEffect(() => {
    initCart();
    initWishlist();
  }, [initCart, initWishlist]);

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Main routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LazyComponent component={Home} />} />
            <Route
              path="products"
              element={<LazyComponent component={Products} />}
            />
            <Route
              path="products/:id"
              element={<LazyComponent component={ProductDetails} />}
            />
            <Route path="cart" element={<LazyComponent component={Cart} />} />
            <Route
              path="wishlist"
              element={<LazyComponent component={StandaloneWishlist} />}
            />
            <Route
              path="checkout"
              element={<LazyComponent component={Checkout} />}
            />
            <Route path="login" element={<LazyComponent component={Login} />} />
            <Route
              path="register"
              element={<LazyComponent component={Register} />}
            />
          </Route>

          {/* User dashboard routes */}
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route
              path="profile"
              element={<LazyComponent component={UserProfile} />}
            />
            <Route
              path="orders"
              element={<LazyComponent component={OrderHistory} />}
            />
            <Route
              path="wishlist"
              element={<LazyComponent component={Wishlist} />}
            />
            <Route
              path="address"
              element={<LazyComponent component={Address} />}
            />
          </Route>

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route
              index
              element={<LazyComponent component={AdminDashboard} />}
            />
            <Route
              path="products"
              element={<LazyComponent component={AdminProducts} />}
            />
            <Route
              path="products/:id"
              element={<LazyComponent component={AdminProductEdit} />}
            />
            <Route
              path="categories"
              element={<LazyComponent component={AdminCategories} />}
            />
            <Route
              path="categories/new"
              element={<LazyComponent component={AdminCategoryEdit} />}
            />
            <Route
              path="categories/:id/edit"
              element={<LazyComponent component={AdminCategoryEdit} />}
            />
            <Route
              path="sizes"
              element={<LazyComponent component={AdminSizes} />}
            />
            <Route
              path="orders"
              element={<LazyComponent component={AdminOrders} />}
            />
            <Route
              path="users"
              element={<LazyComponent component={AdminUsers} />}
            />
          </Route>

          {/* 404 route */}
          <Route path="*" element={<LazyComponent component={NotFound} />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
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
