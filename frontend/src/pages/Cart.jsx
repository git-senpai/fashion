import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiTrash,
  FiShoppingCart,
  FiArrowLeft,
  FiRefreshCw,
} from "react-icons/fi";
import { motion } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import Spinner from "../components/ui/Spinner";
import { toast } from "sonner";

const Cart = () => {
  const {
    cartItems,
    removeFromCart,
    updateCartQuantity,
    initCart,
    isLoading,
    error,
  } = useCartStore();

  const [loadingAction, setLoadingAction] = useState(false);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize cart when component mounts
    initCart();
  }, [initCart]);

  const { itemsCount, subtotal, shipping, tax, total } =
    useCartStore().getTotals();

  const handleQuantityChange = async (id, quantity) => {
    if (quantity < 1) return;

    setLoadingAction(true);
    try {
      await updateCartQuantity(id, quantity);
    } catch (error) {
      toast.error(error.message || "Failed to update quantity");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleRemoveFromCart = async (id) => {
    setLoadingAction(true);
    try {
      await removeFromCart(id);
    } catch (error) {
      toast.error(error.message || "Failed to remove item");
    } finally {
      setLoadingAction(false);
    }
  };

  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate("/checkout");
    } else {
      navigate("/login?redirect=checkout");
    }
  };

  const handleRetry = () => {
    initCart();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Spinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <div className="text-red-500 mb-4 text-xl">
            <FiRefreshCw className="inline-block mr-2 h-6 w-6" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Error Loading Cart
          </h2>
          <p className="text-gray-500 mb-6 text-center max-w-md">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={handleRetry}
              className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300"
            >
              Try Again
            </button>
            <Link
              to="/products"
              className="border border-gray-300 px-6 py-3 rounded-md hover:bg-gray-50 transition-colors duration-300"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center h-[60vh]"
        >
          <FiShoppingCart className="text-gray-300 w-24 h-24 mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            Your cart is empty
          </h2>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added any products to your cart yet.
          </p>
          <Link
            to="/products"
            className="bg-primary text-white px-6 py-3 rounded-md hover:bg-primary-dark transition-colors duration-300 flex items-center gap-2"
          >
            <FiArrowLeft /> Continue Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-8">
        Shopping Cart ({itemsCount} {itemsCount === 1 ? "item" : "items"})
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items */}
        <div className="lg:w-2/3">
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Product
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Price
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Quantity
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 flex-shrink-0">
                          <img
                            className="h-full w-full object-cover rounded"
                            src={item.image}
                            alt={item.name}
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src =
                                "https://placehold.co/100x100?text=No+Image";
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <Link
                            to={`/products/${item._id}`}
                            className="text-sm font-medium text-gray-900 hover:text-primary"
                          >
                            {item.name}
                          </Link>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        ${item.price.toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || loadingAction}
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="mx-3 w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            handleQuantityChange(item._id, item.quantity + 1)
                          }
                          disabled={
                            item.quantity >= item.countInStock || loadingAction
                          }
                          className="w-8 h-8 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        ${(item.price * item.quantity).toFixed(2)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleRemoveFromCart(item._id)}
                        disabled={loadingAction}
                        className="text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <FiTrash className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-between">
            <Link
              to="/products"
              className="flex items-center text-primary hover:text-primary-dark"
            >
              <FiArrowLeft className="mr-2" /> Continue Shopping
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:w-1/3">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-600">
                  Subtotal ({itemsCount} items)
                </span>
                <span className="font-medium">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium">
                  {shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between border-b pb-4">
                <span className="text-gray-600">Tax</span>
                <span className="font-medium">${tax.toFixed(2)}</span>
              </div>

              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loadingAction}
                className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary-dark transition-colors duration-300 mt-6 disabled:opacity-50"
              >
                {loadingAction ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Processing...
                  </>
                ) : (
                  "Proceed to Checkout"
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
