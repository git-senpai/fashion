import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import {
  FiUsers,
  FiShoppingBag,
  FiDollarSign,
  FiTruck,
  FiPackage,
  FiClock,
  FiArrowRight,
  FiAlertTriangle,
  FiMap,
  FiPieChart,
  FiBarChart,
  FiTrendingUp,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { getOrders } from "../../services/orderService";
import { getAllUsers } from "../../services/userService";
import { getAllProducts } from "../../services/productService";
import { getAddresses } from "../../services/addressService";
import categoryService from "../../services/categoryService";
import { Button } from "../../components/ui/Button";
import { toast } from "sonner";
import { useAuth } from "../../hooks/useAuth";

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalProducts: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalAddresses: 0,
    totalCategories: 0,
    ordersByStatus: {},
    productsByCategory: {},
    revenueByMonth: [],
    userGrowth: [],
    topSellingProducts: [],
    salesByCategory: {},
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Check if user is admin before proceeding
        if (!user || !isAdmin) {
          setAuthError(true);
          setLoading(false);
          return;
        }

        // Fetch data from APIs with fallbacks for each
        const [orders, users, products, addresses, categories] = await Promise.all([
          getOrders().catch((err) => {
            console.error("Error fetching orders:", err);
            if (err.message.includes("Not authorized as admin")) {
              setAuthError(true);
            }
            return [];
          }),
          getAllUsers().catch((err) => {
            console.error("Error fetching users:", err);
            if (err.message.includes("Not authorized as admin")) {
              setAuthError(true);
            }
            return [];
          }),
          getAllProducts().catch((err) => {
            console.error("Error fetching products:", err);
            if (err.message.includes("Not authorized as admin")) {
              setAuthError(true);
            }
            return [];
          }),
          getAddresses().catch((err) => {
            console.error("Error fetching addresses:", err);
            return [];
          }),
          categoryService.getCategories().catch((err) => {
            console.error("Error fetching categories:", err);
            return [];
          }),
        ]);

        // Calculate basic statistics with safe access
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
          
        // Calculate orders by status
        const ordersByStatus = {};
        if (Array.isArray(orders)) {
          orders.forEach(order => {
            const status = order.status || "pending";
            ordersByStatus[status] = (ordersByStatus[status] || 0) + 1;
          });
        }
        
        // Calculate products by category
        const productsByCategory = {};
        if (Array.isArray(products)) {
          products.forEach(product => {
            const category = product.category || "Uncategorized";
            productsByCategory[category] = (productsByCategory[category] || 0) + 1;
          });
        }
        
        // Calculate sales by category
        const salesByCategory = {};
        if (Array.isArray(orders) && Array.isArray(products)) {
          orders.forEach(order => {
            if (Array.isArray(order.orderItems)) {
              order.orderItems.forEach(item => {
                const product = products.find(p => p._id === item.product);
                if (product) {
                  const category = product.category || "Uncategorized";
                  const itemTotal = item.price * item.qty;
                  salesByCategory[category] = (salesByCategory[category] || 0) + itemTotal;
                }
              });
            }
          });
        }
        
        // Calculate revenue by month (last 6 months)
        const revenueByMonth = [];
        if (Array.isArray(orders)) {
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = month.toLocaleString('default', { month: 'short' });
            const monthRevenue = orders.reduce((sum, order) => {
              const orderDate = new Date(order.createdAt);
              if (orderDate.getMonth() === month.getMonth() && 
                  orderDate.getFullYear() === month.getFullYear()) {
                return sum + (order.totalPrice || 0);
              }
              return sum;
            }, 0);
            revenueByMonth.push({ month: monthName, revenue: monthRevenue });
          }
        }
        
        // Calculate user growth (last 6 months)
        const userGrowth = [];
        if (Array.isArray(users)) {
          const now = new Date();
          for (let i = 5; i >= 0; i--) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthName = month.toLocaleString('default', { month: 'short' });
            const newUsers = users.filter(user => {
              const registerDate = new Date(user.createdAt);
              return registerDate.getMonth() === month.getMonth() && 
                     registerDate.getFullYear() === month.getFullYear();
            }).length;
            userGrowth.push({ month: monthName, users: newUsers });
          }
        }
        
        // Calculate top selling products
        const topSellingProducts = [];
        if (Array.isArray(orders) && Array.isArray(products)) {
          const productSales = {};
          orders.forEach(order => {
            if (Array.isArray(order.orderItems)) {
              order.orderItems.forEach(item => {
                productSales[item.product] = (productSales[item.product] || 0) + item.qty;
              });
            }
          });
          
          // Get top 5 products by sales
          const productIds = Object.keys(productSales).sort((a, b) => productSales[b] - productSales[a]).slice(0, 5);
          topSellingProducts.push(...productIds.map(id => {
            const product = products.find(p => p._id === id);
            return {
              id,
              name: product ? product.name : 'Unknown Product',
              sales: productSales[id],
              revenue: orders.reduce((sum, order) => {
                const item = (order.orderItems || []).find(i => i.product === id);
                return sum + (item ? item.price * item.qty : 0);
              }, 0)
            };
          }));
        }

        setStats({
          totalSales,
          totalOrders: Array.isArray(orders) ? orders.length : 0,
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalProducts: Array.isArray(products) ? products.length : 0,
          pendingOrders,
          lowStockProducts,
          totalAddresses: Array.isArray(addresses) ? addresses.length : 0,
          totalCategories: Array.isArray(categories) ? categories.length : 0,
          ordersByStatus,
          productsByCategory,
          revenueByMonth,
          userGrowth,
          topSellingProducts,
          salesByCategory,
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
  }, [user, isAdmin]);

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

  // Redirect if not admin
  if (authError || (!loading && (!user || !isAdmin))) {
    toast.error("You are not authorized to access the admin dashboard");
    return <Navigate to="/" replace />;
  }

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
      
      {/* Additional Stats */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <div className="flex items-center">
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <FiMap className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Saved Addresses
              </p>
              <h3 className="text-2xl font-bold">{stats.totalAddresses}</h3>
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
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-pink-100 text-pink-600">
              <FiPieChart className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Product Categories
              </p>
              <h3 className="text-2xl font-bold">{stats.totalCategories}</h3>
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
            <div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-cyan-100 text-cyan-600">
              <FiTrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Average Order Value
              </p>
              <h3 className="text-2xl font-bold">
                {stats.totalOrders > 0 
                  ? formatCurrency(stats.totalSales / stats.totalOrders) 
                  : formatCurrency(0)}
              </h3>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Data Visualizations */}
      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Monthly Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold">Revenue (Last 6 Months)</h3>
          <div className="h-64">
            <div className="flex h-full flex-col justify-end space-x-2">
              <div className="flex h-full items-end space-x-2">
                {stats.revenueByMonth.map((item, index) => {
                  const maxRevenue = Math.max(...stats.revenueByMonth.map(i => i.revenue));
                  const height = maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0;
                  
                  return (
                    <div key={index} className="flex w-full flex-col items-center">
                      <div 
                        className="w-full rounded-t bg-primary" 
                        style={{ height: `${height}%`, minHeight: item.revenue > 0 ? '10%' : '0' }}
                      ></div>
                      <div className="mt-2 text-xs text-muted-foreground">{item.month}</div>
                      <div className="text-xs font-medium">{formatCurrency(item.revenue)}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Order Status Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h3 className="mb-4 text-lg font-semibold">Orders by Status</h3>
          <div className="space-y-4">
            {Object.entries(stats.ordersByStatus).map(([status, count]) => {
              const percentage = stats.totalOrders > 0 
                ? Math.round((count / stats.totalOrders) * 100) 
                : 0;
              
              return (
                <div key={status} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="capitalize text-sm font-medium">
                      {status} 
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({count} orders)
                      </span>
                    </span>
                    <span className="text-sm font-medium">{percentage}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${
                        status === 'delivered' ? 'bg-green-500' :
                        status === 'shipped' ? 'bg-blue-500' :
                        status === 'processing' ? 'bg-purple-500' :
                        status === 'cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* Top Selling Products */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm"
      >
        <h3 className="mb-4 text-lg font-semibold">Top Selling Products</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-full">
            <thead>
              <tr className="border-b border-border text-left text-xs font-medium text-muted-foreground">
                <th className="pb-2 pl-0 pr-4 pt-0">Product</th>
                <th className="px-4 py-0">Units Sold</th>
                <th className="px-4 py-0">Revenue</th>
                <th className="pl-4 pr-0 py-0 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats.topSellingProducts.length > 0 ? (
                stats.topSellingProducts.map((product) => (
                  <tr key={product.id} className="text-sm">
                    <td className="whitespace-nowrap py-3 pl-0 pr-4 font-medium">
                      {product.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">{product.sales}</td>
                    <td className="whitespace-nowrap px-4 py-3">
                      {formatCurrency(product.revenue)}
                    </td>
                    <td className="whitespace-nowrap py-3 pl-4 pr-0 text-right">
                      <Link to={`/admin/products/${product.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td 
                    colSpan="4" 
                    className="py-4 text-center text-muted-foreground"
                  >
                    No product sales data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

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
