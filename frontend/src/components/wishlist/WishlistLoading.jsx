import Spinner from "../../components/ui/Spinner";

const WishlistLoading = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600">Loading your wishlist...</p>
      </div>
    </div>
  );
};

export default WishlistLoading;
