import { useLocation, Link } from "react-router-dom";
import {
  FiHome,
  FiShoppingBag,
  FiUsers,
  FiPackage,
  FiLogOut,
  FiBarChart2,
  FiTag,
  FiMaximize2,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

export const AdminSidebar = ({ mobile }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const routes = [
    {
      name: "Dashboard",
      href: "/admin",
      icon: FiBarChart2,
      exact: true,
    },
    {
      name: "Products",
      href: "/admin/products",
      icon: FiPackage,
    },
    {
      name: "Categories",
      href: "/admin/categories",
      icon: FiTag,
    },
    {
      name: "Sizes",
      href: "/admin/sizes",
      icon: FiMaximize2,
    },
    {
      name: "Orders",
      href: "/admin/orders",
      icon: FiShoppingBag,
    },
    {
      name: "Users",
      href: "/admin/users",
      icon: FiUsers,
    },
  ];

  return (
    <div className="fixed left-0 top-0 z-40 h-screen w-64 bg-card shadow-lg">
      <div className="p-4">
        <Link to="/" className="mb-6 flex items-center space-x-2">
          <span className="text-2xl font-bold">FASHION</span>
          <span className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground">
            Admin
          </span>
        </Link>

        <div className="space-y-6">
          <div className="border-b border-border pb-4">
            <Link
              to="/"
              className="flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary"
            >
              <FiHome className="mr-2 h-4 w-4 text-muted-foreground" />
              Return to Store
            </Link>
          </div>

          <div className="space-y-1">
            <p className="px-3 text-xs font-medium uppercase text-muted-foreground">
              Management
            </p>

            {routes.map((route) => (
              <Link
                key={route.href}
                to={route.href}
                className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  (
                    route.exact
                      ? isActive(route.href)
                      : location.pathname.startsWith(route.href)
                  )
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-secondary"
                }`}
              >
                <route.icon
                  className={`mr-2 h-4 w-4 ${
                    (
                      route.exact
                        ? isActive(route.href)
                        : location.pathname.startsWith(route.href)
                    )
                      ? "text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                />
                {route.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-0 w-full border-t border-border p-4">
        <button
          className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary"
          onClick={logout}
        >
          <FiLogOut className="mr-2 h-4 w-4" />
          Logout
        </button>
      </div>
    </div>
  );
};
