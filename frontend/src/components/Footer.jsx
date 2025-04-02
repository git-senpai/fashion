import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
  FiMapPin,
  FiPhone,
  FiArrowUp,
  FiHeart,
  FiSend,
  FiChevronRight,
} from "react-icons/fi";
import {
  FaCcVisa,
  FaCcMastercard,
  FaCcPaypal,
  FaCcApplePay,
  FaCcStripe,
} from "react-icons/fa";
import { toast } from "sonner";
import { motion } from "framer-motion";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="relative overflow-hidden">
      {/* Decorative Top Edge */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-[#fef5f7] transform -skew-y-2 translate-y-0 z-0"></div>

      {/* Decorative Elements */}
      <div className="absolute bottom-40 right-0 w-72 h-72 rounded-full bg-[#e84a7f]/5 translate-x-1/4 z-0"></div>
      <div className="absolute top-40 left-0 w-64 h-64 rounded-full bg-[#e84a7f]/5 -translate-x-1/4 z-0"></div>

      {/* Back to Top Button */}
      <div className="container mx-auto px-4 pt-12 pb-6 flex justify-center relative z-10">
        <motion.button
          onClick={scrollToTop}
          className="group flex flex-col items-center justify-center space-y-2 text-sm font-medium text-[#e84a7f] hover:text-[#e84a7f]/80 transition-colors duration-300"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center group-hover:shadow-lg transition-all duration-300 border border-[#e84a7f]/10"
          >
            <FiArrowUp className="h-5 w-5" />
          </motion.div>
          <span>Back to top</span>
        </motion.button>
      </div>

      {/* Main Footer Content */}
      <div className="relative pt-16 pb-20 px-4 md:px-8 lg:px-12 bg-gradient-to-b from-[#fef5f7] to-white z-10">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-x-8 gap-y-12">
            {/* Column 1 - About */}
            <div className="lg:col-span-4 space-y-6">
              <div className="space-y-4">
                <Link to="/" className="inline-block">
                  <h3 className="text-2xl font-extrabold text-[#e84a7f]">
                    FASHION
                  </h3>
                </Link>
                <p className="text-sm leading-relaxed text-gray-600 max-w-md">
                  Your premier destination for the latest fashion trends,
                  high-quality clothing, and accessories for men and women.
                  Elevate your style with our curated collections.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-[#e84a7f]/10 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-[#e84a7f]/20 transition-colors duration-300">
                    <FiMapPin className="h-5 w-5 text-[#e84a7f]" />
                  </div>
                  <p className="text-sm text-gray-600 pt-1">
                    123 Fashion Street, Style City, SC 12345
                  </p>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-[#e84a7f]/10 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-[#e84a7f]/20 transition-colors duration-300">
                    <FiPhone className="h-5 w-5 text-[#e84a7f]" />
                  </div>
                  <p className="text-sm text-gray-600 pt-1">
                    +1 (123) 456-7890
                  </p>
                </div>

                <div className="flex items-start group">
                  <div className="w-10 h-10 rounded-full bg-[#e84a7f]/10 flex items-center justify-center flex-shrink-0 mr-4 group-hover:bg-[#e84a7f]/20 transition-colors duration-300">
                    <FiMail className="h-5 w-5 text-[#e84a7f]" />
                  </div>
                  <p className="text-sm text-gray-600 pt-1">
                    contact@fashionstore.com
                  </p>
                </div>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-[#e84a7f]/20 pb-2">
                Quick Links
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    to="/products"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Shop
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cart"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Cart
                  </Link>
                </li>
                <li>
                  <Link
                    to="/wishlist"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 - Customer Service */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-[#e84a7f]/20 pb-2">
                Customer Service
              </h3>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Contact Us
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    FAQs
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Returns & Exchanges
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-sm text-gray-600 hover:text-[#e84a7f] transition-colors duration-300 flex items-center group"
                  >
                    <FiChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-3 group-hover:translate-x-0" />
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            {/* Column 4 - Newsletter */}
            <div className="lg:col-span-4 space-y-6">
              <h3 className="text-lg font-bold text-gray-800 border-b border-[#e84a7f]/20 pb-2">
                Stay Connected
              </h3>
              <div className="space-y-4">
                <p className="text-sm text-gray-600">
                  Subscribe to receive updates, access to exclusive deals, and
                  more fashion inspiration right in your inbox.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-4">
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="Your email address"
                      className="w-full rounded-full border border-[#e84a7f]/20 bg-white px-5 py-4 text-sm focus:outline-none focus:border-[#e84a7f]/50 transition-all duration-300 pr-14"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-[#e84a7f] text-white flex items-center justify-center hover:bg-[#e84a7f]/90 transition-colors duration-300"
                    >
                      <FiSend className="h-4 w-4" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 italic">
                    By subscribing, you agree to our Terms of Service and
                    Privacy Policy. We promise not to spam your inbox!
                  </p>
                </form>
              </div>

              {/* Social Media Links */}
              <div className="space-y-4">
                <h4 className="text-sm font-semibold text-gray-800">
                  Follow Us
                </h4>
                <div className="flex space-x-2">
                  <motion.a
                    href="#"
                    aria-label="Instagram"
                    className="w-10 h-10 rounded-full bg-white border border-[#e84a7f]/20 flex items-center justify-center text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f] transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiInstagram className="h-5 w-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="Twitter"
                    className="w-10 h-10 rounded-full bg-white border border-[#e84a7f]/20 flex items-center justify-center text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f] transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiTwitter className="h-5 w-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="Facebook"
                    className="w-10 h-10 rounded-full bg-white border border-[#e84a7f]/20 flex items-center justify-center text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f] transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiFacebook className="h-5 w-5" />
                  </motion.a>
                  <motion.a
                    href="#"
                    aria-label="Youtube"
                    className="w-10 h-10 rounded-full bg-white border border-[#e84a7f]/20 flex items-center justify-center text-[#e84a7f] hover:bg-[#e84a7f] hover:text-white hover:border-[#e84a7f] transition-all duration-300 shadow-sm hover:shadow-md"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiYoutube className="h-5 w-5" />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom copyright section */}
      <div className="bg-white py-6 border-t border-[#e84a7f]/10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-gray-600 flex items-center">
              &copy; {new Date().getFullYear()} FASHION. Made with
              <FiHeart className="inline-block mx-1 text-[#e84a7f] h-3 w-3" />
              All rights reserved.
            </p>

            {/* Payment Methods */}
            <div className="flex flex-wrap justify-center gap-4">
              <FaCcVisa className="h-8 w-auto text-[#1434CB] transition-transform duration-300 hover:scale-110" />
              <FaCcMastercard className="h-8 w-auto text-[#FF5F00] transition-transform duration-300 hover:scale-110" />
              <FaCcPaypal className="h-8 w-auto text-[#003087] transition-transform duration-300 hover:scale-110" />
              <FaCcApplePay className="h-8 w-auto text-[#000000] transition-transform duration-300 hover:scale-110" />
              <FaCcStripe className="h-8 w-auto text-[#635BFF] transition-transform duration-300 hover:scale-110" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
