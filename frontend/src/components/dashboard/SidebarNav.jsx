import { useLocation, Link } from "react-router-dom";
import {
  FiUser,
  FiShoppingBag,
  FiHeart,
  FiMapPin,
  FiLogOut,
} from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";

export const SidebarNav = ({ mobile }) => {
  const location = useLocation();
  const { logout } = useAuth();

  const isActive = (path) => {
    return location.pathname === path;
  };

  const routes = [
    {
      name: "Profile",
      href: "/dashboard/profile",
      icon: FiUser,
    },
    {
      name: "Orders",
      href: "/dashboard/orders",
      icon: FiShoppingBag,
    },
    {
      name: "Wishlist",
      href: "/dashboard/wishlist",
      icon: FiHeart,
    },
    {
      name: "Addresses",
      href: "/dashboard/address",
      icon: FiMapPin,
    },
  ];

  return (
    <div className="flex flex-col space-y-1">
      {routes.map((route) => (
        <Link
          key={route.href}
          to={route.href}
          className={`flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
            isActive(route.href)
              ? "bg-primary text-primary-foreground"
              : "hover:bg-secondary"
          }`}
        >
          <route.icon
            className={`mr-2 h-4 w-4 ${
              isActive(route.href)
                ? "text-primary-foreground"
                : "text-muted-foreground"
            }`}
          />
          {route.name}
        </Link>
      ))}

      <button
        className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-secondary"
        onClick={logout}
      >
        <FiLogOut className="mr-2 h-4 w-4" />
        Logout
      </button>
    </div>
  );
};
