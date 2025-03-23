import { Outlet, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SidebarNav } from "../components/dashboard/SidebarNav";
import { useAuth } from "../hooks/useAuth";
import { motion } from "framer-motion";

const DashboardLayout = () => {
  const { user, loading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Scroll to top on page change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <div className="container mx-auto flex flex-grow flex-col px-4 py-8 md:flex-row md:gap-8 lg:gap-12">
        {/* Sidebar for desktop */}
        <aside className="hidden md:block md:w-1/4 lg:w-1/5">
          <SidebarNav />
        </aside>

        {/* Mobile menu button */}
        <div className="mb-4 md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex w-full items-center justify-between rounded-lg border border-border p-3 shadow-sm"
          >
            <span className="font-medium">Dashboard Menu</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 transition-transform ${
                isMobileMenuOpen ? "rotate-180" : ""
              }`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {/* Mobile sidebar */}
          {isMobileMenuOpen && (
            <div className="mt-2 rounded-lg border border-border bg-card p-4 shadow-lg">
              <SidebarNav mobile />
            </div>
          )}
        </div>

        {/* Main content */}
        <motion.main
          className="flex-grow md:w-3/4 lg:w-4/5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <Outlet />
          </div>
        </motion.main>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
