import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTruck,
  FiPackage,
  FiClock,
  FiArrowRight,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getOrders } from "../../services/orderService";
import { getAllUsers } from "../../services/userService";
import { getAllProducts } from "../../services/productService";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch data from APIs with fallbacks for each
        const [orders, users, products] = await Promise.all([
          getOrders().catch((err) => {
            console.error("Error fetching orders:", err);
            return [];
          }),
          getAllUsers().catch((err) => {
            console.error("Error fetching users:", err);
            return [];
          }),
          getAllProducts().catch((err) => {
            console.error("Error fetching products:", err);
            return [];
          }),
        ]);

        // Calculate statistics with safe access
        const totalSales = Array.isArray(orders)
          ? orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0)
          : 0;

        const pendingOrders = Array.isArray(orders)
          ? orders.filter((order) => order.status === "pending").length
          : 0;

        const lowStockProducts = Array.isArray(products)
          ? products.filter((product) => (product.countInStock || 0) < 10)
              .length
          : 0;

        setStats({
          totalSales,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalProducts: Array.isArray(products) ? products.length : 0,
          pendingOrders,
          lowStockProducts,
        });

        // Sort orders by date and get the 5 most recent
        const sortedOrders = Array.isArray(orders)
          ? [...orders].sort(
              (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
            )
          : [];

        setRecentOrders(sortedOrders.slice(0, 5));
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast.error("Failed to load dashboard data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { month: "short", day: "numeric", year: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "delivered":
        return "bg-green-100 text-green-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "processing":
        return "bg-purple-100 text-purple-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your admin dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600">
              <FiDollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Sales
              </p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.totalSales)}
              </h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <FiShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Orders
              </p>
              <h3 className="text-2xl font-bold">{stats.totalOrders}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <FiUsers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Users
              </p>
              <h3 className="text-2xl font-bold">{stats.totalUsers}</h3>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <FiPackage className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Products
              </p>
              <h3 className="text-2xl font-bold">{stats.totalProducts}</h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Alert Cards */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center rounded-lg border border-yellow-200 bg-yellow-50 p-4"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
            <FiClock className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-yellow-800">Pending Orders</h3>
            <p className="text-sm text-yellow-600">
              You have {stats.pendingOrders} orders awaiting processing
            </p>
          </div>
          <Link to="/admin/orders?status=pending">
            <Button variant="ghost" size="sm" className="text-yellow-700">
              View All
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center rounded-lg border border-red-200 bg-red-50 p-4"
        >
          <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-red-600">
            <FiPackage className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Low Stock Alert</h3>
            <p className="text-sm text-red-600">
              {stats.lowStockProducts} products are running low on inventory
            </p>
          </div>
          <Link to="/admin/products?stock=low">
            <Button variant="ghost" size="sm" className="text-red-700">
              View All
            </Button>
          </Link>
        </motion.div>
      </div>

      {/* Recent Orders */}
      <div className="rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between border-b border-border p-4">
          <h2 className="text-lg font-semibold">Recent Orders</h2>
          <Link
            to="/admin/orders"
            className="flex items-center text-sm font-medium text-primary hover:underline"
          >
            View All <FiArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {recentOrders.length > 0 ? (
            recentOrders.map((order) => (
              <div
                key={order._id}
                className="p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">Order #{order._id}</h3>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(
                          order.status
                        )}`}
                      >
                        {order.status.charAt(0).toUpperCase() +
                          order.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Placed on {formatDate(order.createdAt)} by{" "}
                      {order.user?.name || "Guest"}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">
                      {formatCurrency(order.totalPrice)}
                    </span>
                    <Link to={`/admin/orders/${order._id}`}>
                      <Button variant="outline" size="sm">
                        Details
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-center text-muted-foreground">
              No recent orders to display
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
