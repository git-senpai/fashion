import { useState } from "react";
import {
  FiSend,
  FiCheckCircle,
  FiStar,
  FiTruck,
  FiCreditCard,
  FiRepeat,
} from "react-icons/fi";

const NewsletterSection = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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
    <section className="bg-[#fef5f7] py-16 md:py-24">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
          {/* Newsletter and trust badges */}
          <div className="flex flex-col justify-center">
            {/* Newsletter Form */}
            <div className="mb-12 animate-fade-in">
              <h2 className="mb-4 text-3xl font-bold text-gray-900 md:text-4xl">
                Join Our Newsletter
              </h2>
              <p className="mb-6 text-gray-600">
                Subscribe to our newsletter and get 10% off your first purchase
                plus updates on new arrivals and exclusive offers.
              </p>

              <form onSubmit={handleSubmit}>
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
                        ? "bg-green-500"
                        : isLoading
                        ? "bg-gray-400"
                        : "bg-[#e84a7f]"
                    } text-white shadow-md transition-all duration-300`}
                  >
                    {isSubmitted ? (
                      <FiCheckCircle className="h-5 w-5" />
                    ) : isLoading ? (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
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
            <div className="grid grid-cols-2 gap-6">
              {trustBadges.map((badge, index) => (
                <div
                  key={index}
                  className="flex flex-col items-center rounded-lg bg-white p-4 text-center shadow-sm animate-fade-in"
                  style={{ animationDelay: `${index * 0.1 + 0.2}s` }}
                >
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#fde2e9] text-[#e84a7f]">
                    {badge.icon}
                  </div>
                  <h3 className="mb-1 font-semibold">{badge.title}</h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Promo Image */}
          <div className="relative h-full min-h-[300px] overflow-hidden rounded-2xl animate-fade-in">
            <img
              src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?q=80&w=2076&auto=format&fit=crop"
              alt="Fashion Promo"
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
            <div className="absolute bottom-0 left-0 right-0 p-8">
              <div
                className="mb-4 inline-block rounded-full bg-[#e84a7f] px-4 py-1 text-sm font-medium text-white animate-fade-in"
                style={{ animationDelay: "0.5s" }}
              >
                SPECIAL OFFER
              </div>
              <h3
                className="mb-2 text-2xl font-bold text-white animate-fade-in"
                style={{ animationDelay: "0.6s" }}
              >
                Get 20% Off Your First Order
              </h3>
              <p
                className="mb-4 text-sm text-white/80 animate-fade-in"
                style={{ animationDelay: "0.7s" }}
              >
                Use code WELCOME20 at checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
