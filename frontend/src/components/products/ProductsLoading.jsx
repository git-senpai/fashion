import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ProductsLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {[...Array(8)].map((_, index) => (
        <div key={index} className="h-80">
          <Skeleton height={280} className="mb-2" />
          <Skeleton height={20} width="80%" className="mb-1" />
          <Skeleton height={20} width="60%" />
        </div>
      ))}
    </div>
  );
};

export default ProductsLoading;
