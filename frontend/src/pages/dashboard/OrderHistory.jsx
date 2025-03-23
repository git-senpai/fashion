import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FiShoppingBag,
  FiChevronRight,
  FiPackage,
  FiClock,
  FiCheck,
  FiXCircle,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { getMyOrders } from "../../services/orderService";
import { Button } from "../../components/ui/Button";

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getMyOrders();
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Not Paid":
        return <FiClock className="h-5 w-5 text-yellow-500" />;
      case "Processing":
        return <FiPackage className="h-5 w-5 text-blue-500" />;
      case "Delivered":
        return <FiCheck className="h-5 w-5 text-green-500" />;
      case "Cancelled":
        return <FiXCircle className="h-5 w-5 text-red-500" />;
      default:
        return <FiClock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Not Paid":
        return "bg-yellow-100 text-yellow-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-6 animate-pulse"
            >
              <div className="mb-4 h-6 w-48 rounded bg-gray-200"></div>
              <div className="mb-2 h-4 w-32 rounded bg-gray-200"></div>
              <div className="mb-4 h-4 w-24 rounded bg-gray-200"></div>
              <div className="flex justify-between">
                <div className="h-8 w-24 rounded bg-gray-200"></div>
                <div className="h-8 w-24 rounded bg-gray-200"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="mb-6 text-2xl font-bold">My Orders</h1>
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-12 text-center">
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
          <h2 className="mb-2 text-xl font-semibold">Error Loading Orders</h2>
          <p className="mb-6 text-muted-foreground">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">My Orders</h1>

      {orders.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <FiShoppingBag className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No Orders Found</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            You haven't placed any orders yet. Start shopping and your orders
            will appear here.
          </p>
          <Link to="/products">
            <Button>Browse Products</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="flex items-center justify-between border-b border-border p-4 md:p-6">
                <div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <span>Order ID: {order._id}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                  <h3 className="mt-1 text-lg font-semibold md:text-xl">
                    {formatCurrency(order.totalPrice)}
                  </h3>
                </div>
                <div className="flex items-center">
                  <span
                    className={`mr-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {getStatusIcon(order.status)}
                    <span className="ml-1.5">{order.status}</span>
                  </span>
                  <Link to={`/orders/${order._id}`}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="hidden md:flex"
                    >
                      View Details
                    </Button>
                    <Button variant="outline" size="icon" className="md:hidden">
                      <FiChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-4 md:p-6">
                <h4 className="mb-3 text-sm font-medium text-muted-foreground">
                  {order.orderItems.length}{" "}
                  {order.orderItems.length === 1 ? "item" : "items"}
                </h4>

                <div className="space-y-3">
                  {order.orderItems.slice(0, 2).map((item) => (
                    <div key={item._id} className="flex items-center">
                      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-border bg-gray-50">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="text-sm font-medium">{item.name}</h4>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {formatCurrency(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}

                  {order.orderItems.length > 2 && (
                    <p className="text-sm text-muted-foreground">
                      + {order.orderItems.length - 2} more{" "}
                      {order.orderItems.length - 2 === 1 ? "item" : "items"}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex border-t border-border p-4 md:p-6">
                {order.status === "Not Paid" && (
                  <Button className="mr-2" size="sm">
                    Pay Now
                  </Button>
                )}
                <Link
                  to={`/orders/${order._id}`}
                  className="flex-1 md:flex-none"
                >
                  <Button variant="outline" size="sm" className="w-full">
                    View Order Details
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
