import React, { useState, useEffect, Suspense } from "react";
import ErrorBoundary from "../components/ErrorBoundary";

// Dynamic imports
const LazyHeroSection = React.lazy(() =>
  import("../components/home/HeroSection")
);

const LazyTopProducts = React.lazy(() =>
  import("../components/home/TopProducts")
);

const LazyFeaturedProducts = React.lazy(() =>
  import("../components/home/FeaturedProducts")
);

const LazyCategoriesSection = React.lazy(() =>
  import("../components/home/CategoriesSection")
);
const LazyNewsletterSection = React.lazy(() =>
  import("../components/home/NewsletterSection")
);

// Fallback component if something fails to load
const SectionFallback = ({ name }) => (
  <div className="py-16 text-center">
    <div className="mx-auto max-w-md p-6 bg-white rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-1">
        Section Unavailable
      </h3>
      <p className="text-gray-600">
        {name ? `The ${name} section` : "This section"} could not be loaded at
        this time.
      </p>
    </div>
  </div>
);

// Loading fallback
const LoadingFallback = () => (
  <div className="h-64 w-full flex items-center justify-center">
    <div className="animate-spin h-8 w-8 border-4 border-[#e84a7f] border-t-transparent rounded-full"></div>
  </div>
);

// Section wrapper with error handling
const SectionWrapper = ({ name, children }) => (
  <ErrorBoundary fallback={<SectionFallback name={name} />}>
    <Suspense fallback={<LoadingFallback />}>{children}</Suspense>
  </ErrorBoundary>
);

const Home = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsLoaded(true);
    }
  }, []);

  if (!isLoaded) {
    return <LoadingFallback />;
  }

  return (
    <div>
      <SectionWrapper name="Hero">
        <LazyHeroSection />
      </SectionWrapper>

      <SectionWrapper name="TopProducts">
        <LazyTopProducts />
      </SectionWrapper>

      <SectionWrapper name="FeaturedProducts">
        <LazyFeaturedProducts />
      </SectionWrapper>

      <SectionWrapper name="Categories">
        <LazyCategoriesSection />
      </SectionWrapper>

      <SectionWrapper name="Newsletter">
        <LazyNewsletterSection />
      </SectionWrapper>
    </div>
  );
};

export default Home;
