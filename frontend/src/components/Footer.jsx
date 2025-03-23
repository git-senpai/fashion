import { useState } from "react";
import { Link } from "react-router-dom";
import {
  FiMail,
  FiInstagram,
  FiTwitter,
  FiFacebook,
  FiYoutube,
} from "react-icons/fi";
import { toast } from "sonner";

export const Footer = () => {
  const [email, setEmail] = useState("");

  const handleNewsletterSubmit = (e) => {
    e.preventDefault();
    if (email) {
      toast.success("Thank you for subscribing to our newsletter!");
      setEmail("");
    }
  };

  return (
    <footer className="border-t border-border bg-card text-card-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 - About */}
          <div>
            <h3 className="mb-4 text-lg font-bold">FASHION</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Your premier destination for the latest fashion trends,
              high-quality clothing, and accessories for men and women.
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                aria-label="Instagram"
                className="text-muted-foreground hover:text-primary"
              >
                <FiInstagram className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Twitter"
                className="text-muted-foreground hover:text-primary"
              >
                <FiTwitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="text-muted-foreground hover:text-primary"
              >
                <FiFacebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                aria-label="Youtube"
                className="text-muted-foreground hover:text-primary"
              >
                <FiYoutube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Column 2 - Quick Links */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Shop
                </Link>
              </li>
              <li>
                <Link
                  to="/cart"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Cart
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3 - Customer Service */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Customer Service</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  FAQs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Returns & Exchanges
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-sm text-muted-foreground hover:text-primary"
                >
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4 - Newsletter */}
          <div>
            <h3 className="mb-4 text-lg font-bold">Newsletter</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Subscribe to receive updates, access to exclusive deals, and more.
            </p>
            <form
              onSubmit={handleNewsletterSubmit}
              className="flex flex-col space-y-2"
            >
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Your email address"
                  className="w-full rounded-md border border-input bg-background px-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} FASHION. All rights reserved.
          </p>
          <div className="mt-2 flex justify-center space-x-4">
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-xs text-muted-foreground hover:text-primary"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
