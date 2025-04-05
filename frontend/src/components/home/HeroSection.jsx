import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const HeroSection = () => {
  return (
    <section className="relative h-[650px] overflow-hidden">
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
      <div className="absolute right-0 top-1/3 h-64 w-64 rounded-full bg-[#e84a7f]/20 blur-3xl animate-fade-in"></div>
      <div className="absolute -left-20 bottom-0 h-96 w-96 rounded-full bg-[#e84a7f]/10 blur-3xl animate-fade-in"></div>

      {/* Content Container */}
      <div className="container relative z-10 mx-auto flex h-full flex-col items-start justify-center px-6 md:px-8 lg:px-12 text-white opacity-100">
        <div className="max-w-3xl">
          {/* Animated Badge */}
          <div className="mb-6 animate-pulse inline-flex items-center rounded-full bg-[#e84a7f]/20 px-4 py-1 backdrop-blur-sm border border-[#e84a7f]/30 animate-fade-in">
            <span className="mr-2 h-2 w-2 rounded-full bg-[#e84a7f]"></span>
            <p className="text-sm font-medium">New Collection Available</p>
          </div>

          {/* Hero Title with gradient text */}
          <h1 className="mb-6 text-5xl font-extrabold leading-tight md:text-6xl lg:text-7xl">
            <span
              className="block animate-fade-in"
              style={{ animationDelay: "0.2s" }}
            >
              Elevate Your Style
            </span>
            <span
              className="block mt-2 bg-gradient-to-r from-white to-[#ffc0cb] bg-clip-text text-transparent animate-fade-in"
              style={{ animationDelay: "0.4s" }}
            >
              With Our Premium Collection
            </span>
          </h1>

          {/* Subtitle with improved styling */}
          <p
            className="mb-8 max-w-xl text-lg font-medium text-white/90 md:text-xl animate-fade-in"
            style={{ animationDelay: "0.6s" }}
          >
            Discover the latest trends in fashion with our carefully curated
            collection of premium clothing and accessories.
          </p>

          {/* CTA Button - Redesigned with left-to-right fill effect */}
          <div className="animate-fade-in" style={{ animationDelay: "0.8s" }}>
            <Link
              to="/products"
              className="relative inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-lg font-bold text-[#e84a7f] shadow-xl transition-all duration-300 border-2 border-[#e84a7f]/30 overflow-hidden group z-10"
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
  );
};

export default HeroSection;
