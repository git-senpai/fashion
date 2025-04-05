import { Link } from "react-router-dom";
import { FiChevronRight } from "react-icons/fi";

const Breadcrumbs = ({ product }) => {
  if (!product) return null;

  const { category, name } = product;

  return (
    <div className="mb-6 flex items-center text-sm text-muted-foreground">
      <Link to="/" className="hover:text-primary">
        Home
      </Link>
      <FiChevronRight className="mx-2 h-4 w-4" />
      <Link to="/products" className="hover:text-primary">
        Products
      </Link>
      {category && (
        <>
          <FiChevronRight className="mx-2 h-4 w-4" />
          <Link
            to={`/products?category=${encodeURIComponent(category)}`}
            className="hover:text-primary"
          >
            {category}
          </Link>
        </>
      )}
      <FiChevronRight className="mx-2 h-4 w-4" />
      <span className="text-foreground">{name}</span>
    </div>
  );
};

export default Breadcrumbs;
