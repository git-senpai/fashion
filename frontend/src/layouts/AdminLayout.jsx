import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { AdminSidebar } from "../components/admin/AdminSidebar";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";
import { toast } from "sonner";

const AdminLayout = () => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Check if user is admin on component mount
  useEffect(() => {
    if (!loading && user && !user.isAdmin) {
      toast.error("Access denied. Admin privileges required.");
    }
  }, [user, loading]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in or not admin
  if (!user) {
    return <Navigate to="/login?redirect=/admin" replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <AdminSidebar />
      </div>

      {/* Mobile menu button */}
      <div className="fixed left-0 top-0 z-40 w-full md:hidden">
        <div className="flex items-center justify-between bg-card p-4 shadow-md">
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="rounded-md bg-primary p-2 text-primary-foreground"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-screen w-64 bg-card p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <AdminSidebar mobile />
          </div>
        </div>
      )}

      {/* Main content */}
      <motion.main
        className="flex-grow pt-16 md:pt-0 md:pl-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container mx-auto p-6">
          <Outlet />
        </div>
      </motion.main>
    </div>
  );
};

export default AdminLayout;
