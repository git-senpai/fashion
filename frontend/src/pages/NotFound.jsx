import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../components/ui/Button";

const NotFound = () => {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-200px)] flex-col items-center justify-center px-4 py-16 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="mb-2 text-9xl font-bold text-primary">404</h1>
        <h2 className="mb-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-8 max-w-md text-muted-foreground">
          The page you are looking for might have been removed, had its name
          changed, or is temporarily unavailable.
        </p>

        <div className="flex flex-col items-center justify-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
          <Link to="/">
            <Button>Return Home</Button>
          </Link>
          <Link to="/products">
            <Button variant="outline">Browse Products</Button>
          </Link>
        </div>
      </motion.div>

      <div className="mt-12">
        <p className="text-sm text-muted-foreground">
          Need help?{" "}
          <Link to="/contact" className="text-primary hover:underline">
            Contact Support
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NotFound;
