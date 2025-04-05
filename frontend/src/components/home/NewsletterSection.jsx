import { useState, useRef, useEffect } from "react";
import {
  FiSend,
  FiCheckCircle,
  FiStar,
  FiTruck,
  FiCreditCard,
  FiRepeat,
} from "react-icons/fi";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Register ScrollTrigger
gsap.registerPlugin(ScrollTrigger);

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef(null);

  // Trust badges data
  const trustBadges = [
    {
      icon: <FiStar className="h-5 w-5" />,
      title: "Premium Quality",
      description: "Crafted with the finest materials",
    },
    {
      icon: <FiTruck className="h-5 w-5" />,
      title: "Free Shipping",
      description: "On orders over $50",
    },
    {
      icon: <FiCreditCard className="h-5 w-5" />,
      title: "Secure Payment",
      description: "100% secure payment",
    },
    {
      icon: <FiRepeat className="h-5 w-5" />,
      title: "Easy Returns",
      description: "30-day return policy",
    },
  ];

  // GSAP animations
  useEffect(() => {
    if (sectionRef.current) {
      // Animate newsletter section elements
      gsap.fromTo(
        ".newsletter-title",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          scrollTrigger: {
            trigger: ".newsletter-section",
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        ".newsletter-subtitle",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.2,
          scrollTrigger: {
            trigger: ".newsletter-section",
            start: "top 70%",
          },
        }
      );

      gsap.fromTo(
        ".newsletter-form",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          delay: 0.3,
          scrollTrigger: {
            trigger: ".newsletter-section",
            start: "top 70%",
          },
        }
      );

      // Animate trust badges
      gsap.fromTo(
        ".trust-badge",
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.1,
          scrollTrigger: {
            trigger: ".trust-badges",
            start: "top 80%",
          },
        }
      );

      // Animate promo image
      gsap.fromTo(
        ".promo-image",
        { x: 50, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: {
            trigger: ".promo-image",
            start: "top 75%",
          },
        }
      );

      gsap.fromTo(
        ".promo-tag",
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 0.6,
          delay: 0.3,
          scrollTrigger: {
            trigger: ".promo-image",
            start: "top 75%",
          },
        }
      );
    }
  }, []);

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setEmail("");

      // Reset form after 3 seconds
      setTimeout(() => {
        setIsSubmitted(false);
      }, 3000);
    }, 1500);
  };

  return (
    <section
      ref={sectionRef}
      className="newsletter-section bg-[#fef5f7] py-16 md:py-24"
    >
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Newsletter and trust badges */}
          <div className="flex flex-col justify-center">
            {/* Newsletter Form */}
            <div className="mb-12">
              <h2 className="newsletter-title mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Join Our Newsletter
              </h2>
              <p className="newsletter-subtitle mb-6 text-gray-600">
                Subscribe to our newsletter and get 10% off your first purchase
                plus updates on new arrivals and exclusive offers.
              </p>

              <form onSubmit={handleSubmit} className="newsletter-form">
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Your email address"
                    disabled={isLoading || isSubmitted}
                    className={`w-full rounded-full border border-gray-300 bg-white px-6 py-4 pr-14 text-gray-900 focus:border-[#e84a7f] focus:outline-none focus:ring-2 focus:ring-[#e84a7f]/20 ${
                      isSubmitted
                        ? "border-green-500 ring-2 ring-green-500/20"
                        : ""
                    }`}
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || isSubmitted}
                    className={`absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full ${
                      isSubmitted
                        ? "bg-green-500 text-white"
                        : "bg-[#e84a7f] text-white"
                    } transition-all duration-300 hover:bg-[#d03d6e]`}
                  >
                    {isLoading ? (
                      <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    ) : isSubmitted ? (
                      <FiCheckCircle className="h-5 w-5" />
                    ) : (
                      <FiSend className="h-5 w-5" />
                    )}
                  </button>
                </div>
                {isSubmitted && (
                  <p className="mt-2 text-sm font-medium text-green-600">
                    Thank you for subscribing!
                  </p>
                )}
              </form>
            </div>

            {/* Trust Badges */}
            <div className="trust-badges grid grid-cols-2 gap-6">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="trust-badge flex items-start gap-3 rounded-lg bg-white p-4 shadow-md"
                >
                  <div className="rounded-full bg-[#e84a7f]/10 p-2 text-[#e84a7f]">
                    {badge.icon}
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">{badge.title}</h3>
                    <p className="text-sm text-gray-600">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Image Area */}
          <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-[#e84a7f]/90 to-[#e84a7f]/70 shadow-xl">
            <div className="p-6 md:p-10">
              {/* Promo Tag */}
              <div className="promo-tag absolute right-8 top-8 flex h-20 w-20 items-center justify-center rounded-full bg-white font-bold text-[#e84a7f] shadow-lg">
                <div className="text-center">
                  <span className="block text-xl">30%</span>
                  <span className="text-xs">OFF</span>
                </div>
              </div>

              {/* Image */}
              <div className="promo-image relative z-10">
                <img
                  src="https://images.unsplash.com/photo-1525507119028-ed4c629a60a3?q=80&w=1972&auto=format&fit=crop"
                  alt="Summer Collection"
                  className="mx-auto h-[450px] w-full rounded-xl object-cover object-center"
                />
              </div>

              {/* Callout */}
              <div className="mt-6 text-center text-white">
                <h3 className="text-2xl font-bold">Summer Collection</h3>
                <p className="mt-2 text-white/80">Refresh your wardrobe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
