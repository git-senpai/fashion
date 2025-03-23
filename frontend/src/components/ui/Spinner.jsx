import React from "react";

const sizeClasses = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-12 w-12",
};

const Spinner = ({ size = "md", className = "" }) => {
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  return (
    <div
      className={`animate-spin rounded-full border-4 border-primary border-t-transparent ${sizeClass} ${className}`}
      aria-label="Loading"
    />
  );
};

export default Spinner;
