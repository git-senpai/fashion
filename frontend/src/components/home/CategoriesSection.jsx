import { useState } from "react";
import { Link } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";

const CategoriesSection = () => {
  // Categories data
  const categories = [
    {
      id: 1,
      title: "Women's Collection",
      description: "Elegant designs for the modern woman",
      image:
        "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=1972&auto=format&fit=crop",
      link: "/products?category=women",
      color: "from-[#e84a7f]/80 to-[#e84a7f]/20",
    },
    {
      id: 2,
      title: "Men's Collection",
      description: "Contemporary styles for today's man",
      image:
        "https://images.unsplash.com/photo-1616879672490-c6d3a23d91f2?q=80&w=1974&auto=format&fit=crop",
      link: "/products?category=men",
      color: "from-[#4a7fe8]/80 to-[#4a7fe8]/20",
    },
    {
      id: 3,
      title: "Accessories",
      description: "Complete your look with our accessories",
      image:
        "https://images.unsplash.com/photo-1588444837495-c6cfeb53f32d?q=80&w=1974&auto=format&fit=crop",
      link: "/products?category=accessories",
      color: "from-[#e8bb4a]/80 to-[#e8bb4a]/20",
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="container mx-auto px-6 md:px-8 lg:px-12">
        {/* Section heading */}
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="text-3xl font-bold text-gray-900 md:text-4xl lg:text-5xl">
            Shop by Category
          </h2>
          <p className="mt-4 text-gray-600 mx-auto max-w-2xl">
            Explore our wide range of collections designed for every style and
            occasion
          </p>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              to={category.link}
              className="group relative h-96 overflow-hidden rounded-xl shadow-lg transition-all duration-500 hover:shadow-2xl animate-fade-in"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              {/* Background image */}
              <div className="absolute inset-0">
                <img
                  src={category.image}
                  alt={category.title}
                  className="h-full w-full object-cover object-center transition-transform duration-700 ease-in-out group-hover:scale-110"
                />
                {/* Gradient overlay */}
                <div
                  className={`absolute inset-0 bg-gradient-to-t ${category.color} opacity-80`}
                ></div>
              </div>

              {/* Content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-white">
                <h3 className="mb-2 text-2xl font-bold md:text-3xl">
                  {category.title}
                </h3>
                <p className="mb-6 max-w-xs opacity-90">
                  {category.description}
                </p>
                <div className="group relative overflow-hidden rounded-full bg-white/20 px-6 py-3 backdrop-blur-sm transition-all duration-300 hover:bg-white/30">
                  <span className="flex items-center gap-2 font-medium">
                    Shop Now
                    <FiArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CategoriesSection;
