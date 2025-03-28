import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiShoppingCart,
  FiUser,
  FiSearch,
  FiMenu,
  FiX,
  FiHeart,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { gsap } from "gsap";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuth();
  const cartItems = useCartStore((state) => state.cartItems);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  // GSAP animation for navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setIsScrolled(true);
        gsap.to(".navbar", {
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
          backdropFilter: "blur(10px)",
          duration: 0.3,
        });
      } else {
        setIsScrolled(false);
        gsap.to(".navbar", {
          backgroundColor: "rgba(255, 255, 255, 1)",
          boxShadow: "none",
          backdropFilter: "blur(0px)",
          duration: 0.3,
        });
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar sticky top-0 z-50 w-full bg-background">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-2xl font-bold">FASHION</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden space-x-8 md:flex">
            <Link
              to="/"
              className="font-medium text-foreground hover:text-primary"
            >
              Home
            </Link>
            <Link
              to="/products"
              className="font-medium text-foreground hover:text-primary"
            >
              Shop
            </Link>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:block">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                placeholder="Search products..."
                className="w-64 rounded-full border-border bg-secondary px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 transform"
              >
                <FiSearch className="h-4 w-4 text-muted-foreground" />
              </button>
            </form>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link to="/wishlist" className="relative">
                <FiHeart className="h-6 w-6 text-foreground" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-xs font-bold text-white">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>
            )}
            <Link to="/cart" className="relative">
              <FiShoppingCart className="h-6 w-6 text-foreground" />
              {cartItems.length > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </Link>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center space-x-1 rounded-full border border-border bg-background p-1.5 text-sm font-medium hover:bg-secondary"
                >
                  <FiUser className="h-5 w-5" />
                </button>
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute right-0 mt-2 w-48 rounded-md bg-card p-2 shadow-lg"
                    >
                      <div className="mb-2 border-b border-border pb-2 pt-1 text-center">
                        <p className="text-sm font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <Link
                        to="/dashboard/profile"
                        className="block rounded-md px-4 py-2 text-sm hover:bg-secondary"
                        onClick={() => setIsOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/wishlist"
                        className="block rounded-md px-4 py-2 text-sm hover:bg-secondary"
                        onClick={() => setIsOpen(false)}
                      >
                        Wishlist
                      </Link>
                      {user.isAdmin && (
                        <Link
                          to="/admin"
                          className="block rounded-md px-4 py-2 text-sm hover:bg-secondary"
                          onClick={() => setIsOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          logout();
                          setIsOpen(false);
                        }}
                        className="block w-full rounded-md px-4 py-2 text-left text-sm hover:bg-secondary"
                      >
                        Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center space-x-1 rounded-md px-2 py-1 text-sm font-medium hover:bg-secondary"
              >
                <FiUser className="h-5 w-5" />
                <span>Login</span>
              </Link>
            )}

            {/* Mobile menu button */}
            <button onClick={toggleMenu} className="rounded-md p-1 md:hidden">
              {isOpen ? (
                <FiX className="h-6 w-6" />
              ) : (
                <FiMenu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden"
            >
              <div className="my-4 space-y-4 pb-4">
                {/* Search on mobile */}
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    className="w-full rounded-md border border-border bg-background px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="absolute right-3 top-1/2 -translate-y-1/2 transform"
                  >
                    <FiSearch className="h-4 w-4 text-muted-foreground" />
                  </button>
                </form>

                <Link
                  to="/"
                  className="block py-2 font-medium"
                  onClick={toggleMenu}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block py-2 font-medium"
                  onClick={toggleMenu}
                >
                  Shop
                </Link>
                <Link
                  to="/cart"
                  className="block py-2 font-medium"
                  onClick={toggleMenu}
                >
                  Cart
                </Link>
                {user && (
                  <Link
                    to="/wishlist"
                    className="block py-2 font-medium"
                    onClick={toggleMenu}
                  >
                    Wishlist
                  </Link>
                )}

                {user ? (
                  <>
                    <Link
                      to="/dashboard/profile"
                      className="block py-2 font-medium"
                      onClick={toggleMenu}
                    >
                      Dashboard
                    </Link>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="block py-2 font-medium"
                        onClick={toggleMenu}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        logout();
                        toggleMenu();
                      }}
                      className="block w-full py-2 text-left font-medium"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block py-2 font-medium"
                    onClick={toggleMenu}
                  >
                    Login / Register
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};
