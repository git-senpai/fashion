import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";

// Register ScrollTrigger plugin
gsap.registerPlugin(ScrollTrigger);

const FeaturedProducts = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);

  // Fetch featured products
  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          "https://fashion-sour-alligator.cyclic.app/api/products?featured=true&limit=4"
        );
        setFeaturedProducts(data.products);
      } catch (error) {
        console.error("Error fetching featured products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  // Set up scroll animations
  useEffect(() => {
    if (sectionRef.current && featuredProducts.length > 0) {
      // Animate section title and subtitle
      gsap.fromTo(
        ".featured-title",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: ".featured-title",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".featured-subtitle",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2,
          scrollTrigger: {
            trigger: ".featured-subtitle",
            start: "top 80%",
          },
        }
      );

      // Animate product cards with stagger
      gsap.fromTo(
        ".product-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: ".products-grid",
            start: "top 75%",
          },
        }
      );

      // Animate view all link
      gsap.fromTo(
        ".view-all-link",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          scrollTrigger: {
            trigger: ".view-all-link",
            start: "top 85%",
          },
        }
      );
    }
  }, [featuredProducts]);

  return (
    <section ref={sectionRef} className="bg-[#fef5f7] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mb-12 text-center">
          <h2 className="featured-title text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Featured Products
          </h2>
          <p className="featured-subtitle mt-4 text-gray-600 mx-auto max-w-2xl">
            Our most popular products based on sales and customer favorites
          </p>
        </div>

        {/* Products grid */}
        {isLoading ? (
          <div className="products-grid grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="product-card h-96 animate-pulse rounded-lg bg-white p-4 shadow-md"
              >
                <div className="h-56 rounded-md bg-gray-300"></div>
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-300"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-300"></div>
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-1/4 rounded bg-gray-300"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-300"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="products-grid grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* View all link */}
            <div className="view-all-link mt-12 text-center">
              <Link
                to="/products"
                className="group inline-flex items-center gap-1 text-[#e84a7f] font-medium transition-all duration-300 hover:gap-3"
              >
                <span>View All Products</span>
                <FiChevronRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
