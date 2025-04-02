import { useState, useEffect } from "react";
import { Link, Navigate } from "react-router-dom";
import { toast } from "sonner";
import { FiEye, FiCheck, FiClock, FiPackage, FiXCircle } from "react-icons/fi";
import { getOrders, deliverOrder } from "../../services/orderService";
import { format } from "date-fns";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Check if user is admin before proceeding
      if (!user || !isAdmin) {
        setAuthError(true);
        setLoading(false);
        return;
      }

      setLoading(true);
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error fetching orders:", error);
      if (error.message.includes("Not authorized as admin")) {
        setAuthError(true);
      }
      toast.error(error.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  const handleDeliverOrder = async (id) => {
    try {
      await deliverOrder(id);
      toast.success("Order marked as delivered");

      // Update order in the state
      setOrders(
        orders.map((order) =>
          order._id === id ? { ...order, status: "Delivered" } : order
        )
      );
    } catch (error) {
      toast.error(error.message || "Failed to update order status");
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Not Paid":
        return <FiClock className="h-4 w-4 text-yellow-500" />;
      case "Processing":
        return <FiPackage className="h-4 w-4 text-blue-500" />;
      case "Delivered":
        return <FiCheck className="h-4 w-4 text-green-500" />;
      case "Cancelled":
        return <FiXCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FiClock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusClass = (status) => {
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

  // Redirect if not admin
  if (authError || (!loading && (!user || !isAdmin))) {
    toast.error("You are not authorized to access the admin orders page");
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">Orders</h1>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="rounded-lg border border-border p-4 animate-pulse"
            >
              <div className="flex justify-between mb-4">
                <div className="h-4 w-48 rounded bg-gray-200"></div>
                <div className="h-4 w-24 rounded bg-gray-200"></div>
              </div>
              <div className="h-4 w-32 rounded bg-gray-200 mb-2"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No orders found</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left">ID</th>
                <th className="px-4 py-2 text-left">User</th>
                <th className="px-4 py-2 text-left">Date</th>
                <th className="px-4 py-2 text-left">Total</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr
                  key={order._id}
                  className="border-b border-border hover:bg-muted/50"
                >
                  <td className="px-4 py-2 text-sm text-muted-foreground">
                    {order._id.slice(-6)}
                  </td>
                  <td className="px-4 py-2">
                    {order.user?.name || "User deleted"}
                  </td>
                  <td className="px-4 py-2">{formatDate(order.createdAt)}</td>
                  <td className="px-4 py-2">
                    {formatCurrency(order.totalPrice)}
                  </td>
                  <td className="px-4 py-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusClass(
                        order.status
                      )}`}
                    >
                      {getStatusIcon(order.status)}
                      <span className="ml-1.5">{order.status}</span>
                    </span>
                  </td>
                  <td className="px-4 py-2 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Link to={`/admin/orders/${order._id}`}>
                        <Button variant="ghost" size="sm">
                          <FiEye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {order.status === "Processing" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeliverOrder(order._id)}
                          className="text-green-600 hover:bg-green-50"
                        >
                          <FiCheck className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Orders;
