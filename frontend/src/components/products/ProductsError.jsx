const ProductsError = ({ error }) => {
  return (
    <div className="container mx-auto px-4 py-20 text-center">
      <h2 className="mb-4 text-2xl font-bold text-destructive">
        Error Loading Products
      </h2>
      <p className="mb-8">{error}</p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
      >
        Try Again
      </button>
    </div>
  );
};

export default ProductsError;
