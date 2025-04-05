import { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import axios from "axios";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProductCard from "./ProductCard";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

// Import Swiper styles
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const TopProducts = () => {
  const [topProducts, setTopProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const sectionRef = useRef(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  // Fetch top products
  useEffect(() => {
    const fetchTopProducts = async () => {
      setIsLoading(true);
      try {
        const { data } = await axios.get(
          "https://fashion-sour-alligator.cyclic.app/api/products?sortBy=sales&limit=8"
        );
        setTopProducts(data.products);
      } catch (error) {
        console.error("Error fetching top products:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  // GSAP animations
  useEffect(() => {
    if (sectionRef.current) {
      // Animate section title and subtitle
      gsap.fromTo(
        ".top-products-title",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: ".top-products-title",
            start: "top 80%",
          },
        }
      );

      gsap.fromTo(
        ".top-products-subtitle",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2,
          scrollTrigger: {
            trigger: ".top-products-subtitle",
            start: "top 80%",
          },
        }
      );

      // Animate slider controls
      gsap.fromTo(
        ".slider-controls",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.3,
          scrollTrigger: {
            trigger: ".top-products-section",
            start: "top 70%",
          },
        }
      );
    }
  }, []);

  return (
    <section
      ref={sectionRef}
      className="top-products-section bg-white py-16 md:py-24"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        {/* Section header with navigation */}
        <div className="mb-10 flex flex-col items-center justify-between gap-4 md:flex-row">
          <div>
            <h2 className="top-products-title text-3xl font-bold text-gray-900 md:text-4xl">
              Best Sellers
            </h2>
            <p className="top-products-subtitle mt-2 text-gray-600">
              Our most popular products that customers love
            </p>
          </div>

          {/* Slider navigation buttons */}
          <div className="slider-controls flex items-center gap-2">
            <button
              ref={prevRef}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-all hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f]"
              aria-label="Previous slide"
            >
              <FiChevronLeft className="h-5 w-5" />
            </button>
            <button
              ref={nextRef}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 transition-all hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f]"
              aria-label="Next slide"
            >
              <FiChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Products slider */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="h-96 animate-pulse rounded-lg bg-gray-100 p-4"
              >
                <div className="h-56 rounded-md bg-gray-200"></div>
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-200"></div>
                <div className="mt-2 h-4 w-1/2 rounded bg-gray-200"></div>
                <div className="mt-4 flex justify-between">
                  <div className="h-4 w-1/4 rounded bg-gray-200"></div>
                  <div className="h-8 w-8 rounded-full bg-gray-200"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={24}
            slidesPerView={1}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              768: {
                slidesPerView: 3,
              },
              1024: {
                slidesPerView: 4,
              },
            }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            pagination={{
              clickable: true,
              el: ".swiper-pagination",
            }}
            navigation={{
              prevEl: prevRef.current,
              nextEl: nextRef.current,
            }}
            onInit={(swiper) => {
              swiper.params.navigation.prevEl = prevRef.current;
              swiper.params.navigation.nextEl = nextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }}
            className="pb-12"
          >
            {topProducts.map((product) => (
              <SwiperSlide key={product._id}>
                <ProductCard product={product} />
              </SwiperSlide>
            ))}
            <div className="swiper-pagination mt-8"></div>
          </Swiper>
        )}
      </div>
    </section>
  );
};

export default TopProducts;
