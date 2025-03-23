import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FiChevronRight, FiPackage, FiSearch, FiFilter } from "react-icons/fi";
import { motion } from "framer-motion";
import { getUserOrders } from "../../services/orderService";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch orders from API
        const data = await getUserOrders();
        setOrders(data);
      } catch (err) {
        console.error("Error fetching orders:", err);
        setError("Failed to load your orders. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on search term and status
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchTerm === "" ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems.some((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesStatus =
      filterStatus === "all" || order.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // Get order status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-indigo-100 text-indigo-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Orders</h1>
        <Link to="/products">
          <Button variant="outline" size="sm">
            Continue Shopping
          </Button>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by order ID or product name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center space-x-2">
          <FiFilter className="text-muted-foreground" />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      <div className="rounded-lg border border-border">
        {loading ? (
          <div className="p-4">
            {Array(3)
              .fill()
              .map((_, index) => (
                <div
                  key={index}
                  className="mb-4 rounded-lg border border-border p-4 last:mb-0"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="w-full space-y-2 sm:w-1/3">
                      <Skeleton width={120} />
                      <Skeleton width={150} />
                    </div>
                    <div className="w-full sm:w-1/3">
                      <Skeleton width={80} height={24} />
                    </div>
                    <div className="w-full text-right sm:w-1/3">
                      <Skeleton width={100} className="ml-auto" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <Skeleton height={60} />
                  </div>
                </div>
              ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="mb-1 text-lg font-semibold">Error Loading Orders</h2>
            <p className="mb-4 text-muted-foreground">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              size="sm"
              variant="outline"
            >
              Try Again
            </Button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="mb-4 rounded-full bg-muted p-3">
              <FiPackage className="h-6 w-6 text-muted-foreground" />
            </div>
            {searchTerm || filterStatus !== "all" ? (
              <>
                <h2 className="mb-1 text-lg font-semibold">No Orders Found</h2>
                <p className="mb-4 text-muted-foreground">
                  We couldn't find any orders matching your search criteria.
                </p>
                <Button
                  onClick={() => {
                    setSearchTerm("");
                    setFilterStatus("all");
                  }}
                  size="sm"
                  variant="outline"
                >
                  Clear Filters
                </Button>
              </>
            ) : (
              <>
                <h2 className="mb-1 text-lg font-semibold">No Orders Yet</h2>
                <p className="mb-4 text-muted-foreground">
                  You haven't placed any orders yet. Start shopping to place
                  your first order!
                </p>
                <Link to="/products">
                  <Button>Shop Now</Button>
                </Link>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredOrders.map((order) => (
              <motion.div
                key={order._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
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
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ${order.totalPrice.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {order.orderItems.length}{" "}
                      {order.orderItems.length === 1 ? "item" : "items"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between rounded-md bg-muted p-2">
                    <div className="flex flex-1 items-center space-x-4">
                      <div className="flex-shrink-0">
                        <img
                          src={order.orderItems[0].image}
                          alt={order.orderItems[0].name}
                          className="h-14 w-14 rounded-md object-cover"
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-medium">
                          {order.orderItems[0].name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Qty: {order.orderItems[0].qty}
                          {order.orderItems.length > 1 &&
                            ` + ${order.orderItems.length - 1} more item(s)`}
                        </p>
                      </div>
                    </div>
                    <Link
                      to={`/dashboard/orders/${order._id}`}
                      className="ml-4 flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      View Details <FiChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
