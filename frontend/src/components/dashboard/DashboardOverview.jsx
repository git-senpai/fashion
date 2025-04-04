import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiShoppingBag, FiHeart, FiMapPin } from "react-icons/fi";
import { getAddresses } from "../../services/addressService";
import { useWishlistStore } from "../../store/useWishlistStore";

const DashboardOverview = () => {
  const [addressCount, setAddressCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const wishlistItems = useWishlistStore((state) => state.wishlistItems);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch address count
        const addresses = await getAddresses();
        setAddressCount(addresses.length);
        
        // For demo purposes, we'll set a static orders count
        // In a real app, you would fetch this from an orders API
        setOrdersCount(5);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    {
      id: 1,
      name: "My Orders",
      value: ordersCount,
      icon: FiShoppingBag,
      href: "/dashboard/orders",
      color: "bg-primary/10 text-primary",
    },
    {
      id: 2,
      name: "Wishlist Items",
      value: wishlistItems.length,
      icon: FiHeart,
      href: "/dashboard/wishlist",
      color: "bg-pink-100 text-pink-600",
    },
    {
      id: 3,
      name: "Saved Addresses",
      value: addressCount,
      icon: FiMapPin,
      href: "/dashboard/address",
      color: "bg-blue-100 text-blue-600",
    },
  ];

  if (loading) {
    return (
      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold">Overview</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="flex animate-pulse items-center justify-between rounded-lg border border-border p-4"
            >
              <div className="h-10 w-10 rounded-full bg-muted"></div>
              <div className="flex-1 space-y-2 pl-4">
                <div className="h-4 w-24 rounded bg-muted"></div>
                <div className="h-6 w-12 rounded bg-muted"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Overview</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.id}
            to={stat.href}
            className="flex items-center justify-between rounded-lg border border-border p-4 transition-colors hover:bg-secondary/50"
          >
            <div className={`rounded-full p-3 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div className="flex flex-1 flex-col pl-4">
              <span className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </span>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview; 