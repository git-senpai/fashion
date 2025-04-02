import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { FiArrowRight } from "react-icons/fi";
import {
  getTopProducts,
  getFeaturedProducts,
} from "../services/productService";
import { ProductCard } from "../components/ProductCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const Home = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const [topData, featuredData] = await Promise.all([
          getTopProducts(),
          getFeaturedProducts(),
        ]);
        setTopProducts(topData);
        setFeaturedProducts(featuredData);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // GSAP animation for hero section with subtle fade
  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline();

      // Animate hero elements with staggered effect
      tl.fromTo(
        ".hero-badge",
        { y: -20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: "power2.out",
        }
      )
        .fromTo(
          ".hero-title span:first-child",
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.3"
        )
        .fromTo(
          ".hero-title span:last-child",
          { y: 30, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power2.out",
          },
          "-=0.5"
        )
        .fromTo(
          ".hero-subtitle",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
          },
          "-=0.4"
        )
        .fromTo(
          ".hero-cta",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.5,
            ease: "power2.out",
          },
          "-=0.3"
        );

      // Animate decorative elements
      gsap.fromTo(
        ".decorative-blur",
        {
          opacity: 0,
          scale: 0.8,
        },
        {
          opacity: 1,
          scale: 1,
          duration: 1.5,
          ease: "power1.out",
          delay: 0.5,
        }
      );
    }
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[650px] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-[#e84a7f]/40"></div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-[#e84a7f]/20 blur-3xl decorative-blur"></div>
        <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-[#e84a7f]/10 blur-3xl decorative-blur"></div>

        {/* Content Container */}
        <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-center px-6 md:px-8 lg:px-12 text-white opacity-100">
          <div className="max-w-3xl">
            {/* Animated Badge */}
            <div className="mb-6 animate-pulse inline-flex items-center rounded-full bg-[#e84a7f]/20 px-4 py-1 backdrop-blur-sm border border-[#e84a7f]/30 hero-badge">
              <span className="mr-2 h-2 w-2 rounded-full bg-[#e84a7f]"></span>
              <p className="text-sm font-medium">New Collection Available</p>
            </div>

            {/* Hero Title with gradient text */}
            <h1 className="hero-title mb-6 text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
              <span className="block">Elevate Your Style</span>
              <span className="block mt-2 bg-gradient-to-r from-white to-[#ffc0cb] bg-clip-text text-transparent">
                With Our Premium Collection
              </span>
            </h1>

            {/* Subtitle with improved styling */}
            <p className="hero-subtitle mb-8 max-w-xl text-lg font-medium text-white/90 md:text-xl">
              Discover the latest trends in fashion with our carefully curated
              collection of premium clothing and accessories.
            </p>

            {/* CTA Button - Redesigned with left-to-right fill effect */}
            <div>
              <Link
                to="/products"
                className="hero-cta relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#e84a7f] shadow-xl transition-all duration-300 border-2 border-[#e84a7f]/30 overflow-hidden group z-10"
                style={{
                  boxShadow: "0 15px 30px -5px rgba(232, 74, 127, 0.5)",
                }}
              >
                <span className="absolute left-0 top-0 h-full w-0 rounded-full bg-[#e84a7f] transition-all duration-300 ease-out group-hover:w-full -z-10"></span>
                <span className="relative z-10 transition-colors duration-300 group-hover:text-white">
                  Shop Now
                </span>
                <span className="relative flex h-8 w-8 items-center justify-center rounded-full bg-[#e84a7f]/10 z-10 transition-colors duration-300 group-hover:bg-white/20">
                  <FiArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </Link>
            </div>
          </div>
        </div>

        {/* Diagonal separator */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-[#fef5f7] transform -skew-y-2 translate-y-8"></div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-[#fde2e9] rounded-full -translate-y-1/2 translate-x-1/3 opacity-70"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#fde2e9] rounded-full translate-y-1/3 -translate-x-1/4 opacity-50"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 flex flex-col items-center">
            <span className="px-4 py-1.5 bg-[#e84a7f]/10 text-[#e84a7f] text-sm font-medium rounded-full mb-4">
              Our Collection
            </span>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Featured Products
            </motion.h2>

            <motion.p
              className="max-w-xl text-center text-gray-600 mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover our handpicked selection of premium fashion pieces,
              designed to elevate your style and make a statement.
            </motion.p>

            <motion.div
              className="h-1 w-20 bg-[#e84a7f] rounded-full"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: 80 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array(4)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-[#f7cad5] p-4 bg-white shadow-sm"
                    >
                      <Skeleton height={250} className="mb-4 rounded-lg" />
                      <Skeleton width={150} className="mb-2" />
                      <Skeleton width={100} className="mb-2" />
                      <Skeleton width={80} />
                    </div>
                  ))
              : featuredProducts.map((product) => (
                  <motion.div
                    key={product._id}
                    whileHover={{ y: -8, transition: { duration: 0.2 } }}
                    className="transition-all duration-300"
                  >
                    <ProductCard product={product} />
                  </motion.div>
                ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/products"
              className="relative group inline-flex items-center gap-2 px-8 py-4 bg-white rounded-full font-semibold text-[#e84a7f] shadow-lg border border-[#e84a7f]/20 overflow-hidden transition-all duration-300 hover:shadow-xl"
            >
              <span className="absolute left-0 top-0 h-full w-0 bg-[#e84a7f] opacity-20 transition-all duration-300 group-hover:w-full"></span>
              <span className="relative">View All Products</span>
              <FiArrowRight className="relative transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="bg-secondary py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <motion.h2
              className="text-3xl font-bold md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Shop By Category
            </motion.h2>
            <motion.div
              className="mx-auto mt-2 h-1 w-20 bg-primary"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: 80 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Men's Category */}
            <motion.div
              className="group relative h-[300px] overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1617196701537-7329482cc9fe?q=80&w=1974&auto=format&fit=crop"
                alt="Men's Fashion"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-3 text-xl font-bold text-white text-shadow">
                  Men's Fashion
                </h3>
                <Link
                  to="/products?category=men"
                  className="category-button inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>

            {/* Women's Category */}
            <motion.div
              className="group relative h-[300px] overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1485968579580-b6d095142e6e?q=80&w=2060&auto=format&fit=crop"
                alt="Women's Fashion"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-3 text-xl font-bold text-white text-shadow">
                  Women's Fashion
                </h3>
                <Link
                  to="/products?category=women"
                  className="category-button inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>

            {/* Accessories Category */}
            <motion.div
              className="group relative h-[300px] overflow-hidden rounded-lg"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3 }}
            >
              <img
                src="https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=1935&auto=format&fit=crop"
                alt="Accessories"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
              <div className="absolute bottom-0 left-0 p-6">
                <h3 className="mb-3 text-xl font-bold text-white text-shadow">
                  Accessories
                </h3>
                <Link
                  to="/products?category=accessories"
                  className="category-button inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-white shadow-md transition-all duration-200 hover:bg-primary/90 hover:shadow-lg"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-20 relative bg-gradient-to-b from-[#fef5f7] to-white">
        {/* Decorative Elements */}
        <div className="absolute left-0 right-0 top-0 h-24 bg-white transform -skew-y-2"></div>
        <div className="absolute top-1/4 left-12 w-20 h-20 rounded-full bg-[#f7cad5] opacity-30 blur-xl"></div>
        <div className="absolute top-1/2 right-12 w-32 h-32 rounded-full bg-[#f7cad5] opacity-30 blur-xl"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="mb-16 mx-auto max-w-xl text-center">
            <div className="inline-flex items-center justify-center w-14 h-14 mb-6 rounded-full bg-[#e84a7f]/10">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                  fill="#e84a7f"
                />
              </svg>
            </div>

            <motion.h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold mb-5"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Our Best Sellers
            </motion.h2>

            <motion.p
              className="text-gray-600 mb-4"
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Discover our most popular fashion pieces that customers love.
              These trending items deliver on style, quality, and satisfaction.
            </motion.p>
          </div>

          <div className="relative">
            {/* Highlight Badge */}
            <div className="absolute -top-10 right-8 z-20 bg-[#e84a7f] text-white px-4 py-2 rounded-lg shadow-lg transform rotate-3">
              <span className="font-bold">Customer Favorites</span>
            </div>

            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {loading
                ? Array(4)
                    .fill()
                    .map((_, index) => (
                      <div
                        key={index}
                        className="rounded-xl border border-[#f7cad5] p-4 bg-white shadow-md"
                      >
                        <Skeleton height={250} className="mb-4 rounded-lg" />
                        <Skeleton width={150} className="mb-2" />
                        <Skeleton width={100} className="mb-2" />
                        <Skeleton width={80} />
                      </div>
                    ))
                : topProducts.map((product, index) => (
                    <motion.div
                      key={product._id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      whileHover={{ y: -8, transition: { duration: 0.2 } }}
                      className="relative"
                    >
                      {index === 0 && (
                        <div className="absolute -top-4 -right-4 z-10 bg-yellow-400 text-xs font-bold text-gray-800 px-3 py-1 rounded-full shadow-md transform rotate-12">
                          #1 Best Seller
                        </div>
                      )}
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
            </div>
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="overflow-hidden py-16 relative">
        {/* Background with gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#e84a7f]/80 to-[#e84a7f]/95 z-0"></div>

        {/* Decorative Elements */}
        <div className="absolute left-0 top-0 h-48 w-48 rounded-full bg-white/10 -translate-x-24 -translate-y-24"></div>
        <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-white/10 translate-x-32 translate-y-32"></div>
        <div className="absolute left-1/3 bottom-10 h-16 w-16 rounded-full bg-white/20"></div>
        <div className="absolute right-1/4 top-10 h-24 w-24 rounded-full bg-white/10"></div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Content Area */}
            <motion.div
              className="lg:col-span-6 text-white"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="bg-white/10 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-white/20 shadow-xl">
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/20 mb-6">
                  <span className="h-2 w-2 rounded-full bg-white animate-pulse"></span>
                  <span className="text-sm font-medium text-white">
                    Limited Time Offer
                  </span>
                </div>

                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 leading-tight">
                  Get <span className="text-yellow-300">20% OFF</span> Your
                  First Order
                </h2>

                <p className="mb-8 text-lg text-white/90 max-w-md">
                  Sign up for our newsletter and receive an exclusive discount
                  on your first purchase. Stay updated with the latest trends
                  and offers.
                </p>

                {/* Newsletter Form */}
                <form className="flex flex-col sm:flex-row gap-3 mb-6 max-w-md">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-grow px-5 py-3 rounded-full focus:outline-none text-gray-800 placeholder-gray-500"
                  />
                  <button
                    type="submit"
                    className="px-6 py-3 bg-white text-[#e84a7f] font-bold rounded-full hover:bg-yellow-300 hover:text-gray-800 transition-all duration-300 shadow-md"
                  >
                    Subscribe
                  </button>
                </form>

                {/* Trust Badges */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>No Spam</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Cancel Anytime</span>
                  </div>
                  <div className="flex items-center gap-1 text-white/80 text-sm">
                    <svg
                      className="h-5 w-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Exclusive Deals</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Image Area */}
            <motion.div
              className="lg:col-span-6 relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative mx-auto max-w-lg">
                {/* Main Image */}
                <div className="relative z-20 rounded-2xl shadow-2xl overflow-hidden border-4 border-white/30">
                  <img
                    src="https://images.unsplash.com/photo-1581338834647-b0fb40704e21?q=80&w=1974&auto=format&fit=crop"
                    alt="Fashion Collection"
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Promo Tag */}
                <div className="absolute -right-5 -top-5 z-30 h-28 w-28 md:h-32 md:w-32 bg-yellow-300 rounded-full flex flex-col items-center justify-center shadow-lg transform rotate-12 animate-pulse">
                  <span className="text-lg md:text-xl font-bold text-gray-800 -rotate-12">
                    20%
                  </span>
                  <span className="text-sm font-bold text-gray-800 -rotate-12">
                    OFF
                  </span>
                </div>

                {/* Decorative elements */}
                <div className="absolute -left-4 top-1/4 w-8 h-24 bg-white/30 rounded-full transform -rotate-45"></div>
                <div className="absolute -right-4 bottom-1/4 w-8 h-24 bg-white/30 rounded-full transform rotate-45"></div>

                {/* Product Callout */}
                <div className="absolute -bottom-8 -left-8 z-30 bg-white rounded-lg shadow-xl p-4 max-w-[280px] transform -rotate-3">
                  <div className="flex items-start gap-3">
                    <div className="h-14 w-14 rounded-md overflow-hidden flex-shrink-0">
                      <img
                        src="https://images.unsplash.com/photo-1591369822096-ffd140ec948f?q=80&w=1974&auto=format&fit=crop"
                        alt="Product"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <div className="text-xs text-green-600 font-medium">
                        Best Seller
                      </div>
                      <div className="text-sm font-semibold">
                        Summer Collection
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className="h-3 w-3 text-yellow-400"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                        <span className="text-xs text-gray-600">(120+)</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
