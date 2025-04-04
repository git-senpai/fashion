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
  FiChevronDown,
} from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { useCartStore } from "../store/useCartStore";
import { useWishlistStore } from "../store/useWishlistStore";
import { gsap } from "gsap";

export const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const cartItems = useCartStore((state) => state.cartItems);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  // GSAP animation for navbar on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 50) {
        setIsScrolled(true);
        gsap.to(".navbar", {
          backgroundColor: "rgba(255, 255, 255, 0.95)",
          boxShadow: "0 4px 20px rgba(232, 74, 127, 0.1)",
          backdropFilter: "blur(10px)",
          height: "70px",
          padding: "0.5rem 0",
          duration: 0.3,
        });
      } else {
        setIsScrolled(false);
        gsap.to(".navbar", {
          backgroundColor: "rgba(254, 245, 247, 0.9)",
          boxShadow: "none",
          backdropFilter: "blur(0px)",
          height: "80px",
          padding: "1rem 0",
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
      setMobileMenuOpen(false);
    }
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <nav
      className="navbar sticky top-0 z-50 w-full transition-all duration-300"
      style={{
        height: "80px",
        backgroundColor: "rgba(254, 245, 247, 0.9)",
      }}
    >
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center">
          <span className="text-3xl font-extrabold bg-gradient-to-r from-primary to-primary bg-clip-text  drop-shadow-sm">
            FASHION
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden lg:flex items-center space-x-6">
          <Link
            to="/"
            className="font-medium text-foreground hover:text-primary transition-colors duration-200"
          >
            Home
          </Link>
          <Link
            to="/products"
            className="font-medium text-foreground hover:text-primary transition-colors duration-200"
          >
            Shop
          </Link>
        </div>

        {/* Search Bar - Desktop */}
        <div className="hidden lg:block ml-6 flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products..."
              className="w-full rounded-full border-border bg-white/70 px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:bg-white transition-all duration-200 shadow-soft"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 transform text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <FiSearch className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Icons */}
        <div className="flex items-center space-x-5">
          {user && (
            <Link to="/wishlist" className="relative hidden sm:block">
              <div className="relative p-2 rounded-full hover:bg-accent/40 transition-colors duration-200">
                <FiHeart className="h-5 w-5 text-foreground" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-soft">
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </Link>
          )}

          <Link to="/cart" className="relative">
            <div className="relative p-2 rounded-full hover:bg-accent/40 transition-colors duration-200">
              <FiShoppingCart className="h-5 w-5 text-foreground" />
              {cartItems.length > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground shadow-soft">
                  {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                </span>
              )}
            </div>
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={toggleMenu}
                className="flex items-center space-x-1 rounded-full border border-border/60 bg-white p-1.5 text-sm font-medium hover:bg-accent/30 transition-all duration-200 shadow-soft"
              >
                <FiUser className="h-5 w-5" />
              </button>
              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-60 rounded-lg bg-white p-2 shadow-soft border border-border/60 z-20"
                  >
                    <div className="mb-2 border-b border-border/60 pb-2 pt-1 text-center">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <Link
                      to="/dashboard/profile"
                      className="block rounded-md px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors duration-150"
                      onClick={() => setIsOpen(false)}
                    >
                      Profile
                    </Link>
                    <Link
                      to="/wishlist"
                      className="block rounded-md px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors duration-150"
                      onClick={() => setIsOpen(false)}
                    >
                      Wishlist
                    </Link>
                    {user.isAdmin && (
                      <Link
                        to="/admin"
                        className="block rounded-md px-4 py-2.5 text-sm hover:bg-accent/30 transition-colors duration-150"
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
                      className="block w-full rounded-md px-4 py-2.5 text-left text-sm hover:bg-destructive/10 hover:text-destructive transition-colors duration-150 mt-1"
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
              className="flex items-center space-x-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors duration-200 shadow-soft"
            >
              <FiUser className="h-4 w-4 mr-1" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="rounded-full p-2 hover:bg-accent/40 transition-colors duration-200 lg:hidden"
          >
            {mobileMenuOpen ? (
              <FiX className="h-5 w-5" />
            ) : (
              <FiMenu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={mobileMenuVariants}
            className="lg:hidden overflow-hidden bg-white border-t border-border/60 shadow-soft"
          >
            <div className="container mx-auto px-4 py-4 space-y-4">
              <form onSubmit={handleSearch} className="relative mb-6">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="w-full rounded-full border-border bg-secondary/50 px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
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

              <div className="space-y-3 py-2">
                <Link
                  to="/"
                  className="block py-2.5 text-base font-medium hover:text-primary transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/products"
                  className="block py-2.5 text-base font-medium hover:text-primary transition-colors duration-150"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Shop
                </Link>
                {user && (
                  <Link
                    to="/wishlist"
                    className="block py-2.5 text-base font-medium hover:text-primary transition-colors duration-150"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Wishlist
                  </Link>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
