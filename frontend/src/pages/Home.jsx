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

  // GSAP animation for hero section
  useEffect(() => {
    if (heroRef.current) {
      const tl = gsap.timeline();

      tl.from(".hero-title", {
        y: 50,
        opacity: 0,
        duration: 0.8,
        ease: "power3.out",
      })
        .from(
          ".hero-subtitle",
          {
            y: 30,
            opacity: 0,
            duration: 0.8,
            ease: "power3.out",
          },
          "-=0.5"
        )
        .from(
          ".hero-cta",
          {
            y: 20,
            opacity: 0,
            duration: 0.6,
            ease: "power3.out",
          },
          "-=0.5"
        );
    }
  }, []);

  return (
    <div>
      {/* Hero Section */}
      <section ref={heroRef} className="relative h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop")',
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        <div className="container relative z-10 mx-auto flex h-full flex-col items-center justify-center px-4 text-center text-white">
          <h1 className="hero-title mb-6 max-w-4xl text-5xl font-bold leading-tight md:text-6xl lg:text-7xl">
            Elevate Your Style With Our Premium Collection
          </h1>
          <p className="hero-subtitle mb-8 max-w-2xl text-lg text-gray-200 md:text-xl">
            Discover the latest trends in fashion with our carefully curated
            collection of premium clothing and accessories.
          </p>
          <Link
            to="/products"
            className="hero-cta group flex items-center gap-2 rounded-full bg-white px-6 py-3 text-lg font-semibold text-black transition-transform hover:scale-105"
          >
            Shop Now
            <FiArrowRight className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <motion.h2
              className="text-3xl font-bold md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Featured Products
            </motion.h2>
            <motion.div
              className="mx-auto mt-2 h-1 w-20 bg-primary"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: 80 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array(4)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border p-4"
                    >
                      <Skeleton height={250} className="mb-4" />
                      <Skeleton width={150} className="mb-2" />
                      <Skeleton width={100} className="mb-2" />
                      <Skeleton width={80} />
                    </div>
                  ))
              : featuredProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/products"
              className="group inline-flex items-center gap-2 rounded-md border border-primary px-6 py-3 font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              View All Products
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
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
                <h3 className="mb-2 text-xl font-bold text-white">
                  Men's Fashion
                </h3>
                <Link
                  to="/products?category=men"
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
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
                <h3 className="mb-2 text-xl font-bold text-white">
                  Women's Fashion
                </h3>
                <Link
                  to="/products?category=women"
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
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
                <h3 className="mb-2 text-xl font-bold text-white">
                  Accessories
                </h3>
                <Link
                  to="/products?category=accessories"
                  className="inline-flex items-center rounded-full bg-white px-4 py-2 text-sm font-medium text-black transition-transform hover:scale-105"
                >
                  Shop Now
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Top Products Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <motion.h2
              className="text-3xl font-bold md:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              Best Sellers
            </motion.h2>
            <motion.div
              className="mx-auto mt-2 h-1 w-20 bg-primary"
              initial={{ opacity: 0, width: 0 }}
              whileInView={{ opacity: 1, width: 80 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            ></motion.div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {loading
              ? Array(4)
                  .fill()
                  .map((_, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-border p-4"
                    >
                      <Skeleton height={250} className="mb-4" />
                      <Skeleton width={150} className="mb-2" />
                      <Skeleton width={100} className="mb-2" />
                      <Skeleton width={80} />
                    </div>
                  ))
              : topProducts.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
          </div>
        </div>
      </section>

      {/* Promotion Banner */}
      <section className="overflow-hidden bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <motion.div
              className="mb-8 text-center lg:mb-0 lg:text-left"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="mb-4 text-3xl font-bold md:text-4xl">
                Special Offer
              </h2>
              <p className="mb-6 max-w-md text-lg opacity-90">
                Sign up for our newsletter and get 20% off your first order.
                Don't miss out on this exclusive offer!
              </p>
              <Link
                to="/products"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 font-medium text-primary transition-transform hover:scale-105"
              >
                Shop Now
              </Link>
            </motion.div>

            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="relative h-[300px] w-[300px] overflow-hidden rounded-full md:h-[400px] md:w-[400px]">
                <img
                  src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=1974&auto=format&fit=crop"
                  alt="Special Offer"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="absolute -right-4 top-0 flex h-24 w-24 items-center justify-center rounded-full bg-white text-center text-primary md:h-32 md:w-32">
                <div>
                  <p className="text-xl font-bold md:text-2xl">20%</p>
                  <p className="text-sm font-medium">OFF</p>
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
