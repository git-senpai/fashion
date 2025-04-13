import { Link } from "react-router-dom";
import { FiChevronRight, FiHome } from "react-icons/fi";

const Breadcrumbs = ({ product }) => {
  if (!product) return null;

  const { category, name } = product;

  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <li>
          <Link
            to="/"
            className="flex items-center gap-1 hover:text-primary"
            aria-label="Home"
          >
            <FiHome className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only">Home</span>
          </Link>
        </li>

        <li className="flex items-center">
          <FiChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </li>

        <li>
          <Link to="/products" className="hover:text-primary">
            Products
          </Link>
        </li>

        {category && (
          <>
            <li className="flex items-center">
              <FiChevronRight className="h-3.5 w-3.5 text-gray-400" />
            </li>
            <li>
              <Link
                to={`/products?category=${encodeURIComponent(category)}`}
                className="hover:text-primary"
              >
                {category}
              </Link>
            </li>
          </>
        )}

        <li className="flex items-center">
          <FiChevronRight className="h-3.5 w-3.5 text-gray-400" />
        </li>

        <li>
          <span className="max-w-[200px] truncate font-medium text-gray-800 sm:max-w-xs">
            {name}
          </span>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
