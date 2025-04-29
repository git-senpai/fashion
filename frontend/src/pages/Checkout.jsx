import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCreditCard, FiLock, FiChevronRight, FiMapPin } from "react-icons/fi";
import { motion } from "framer-motion";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../hooks/useAuth";
import { createOrder } from "../services/orderService";
import { getAddresses } from "../services/addressService";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { FormGroup, FormLabel, FormMessage } from "../components/ui/Form";

const Checkout = () => {
  const navigate = useNavigate();
  const { cartItems, clearCart, subtotal, tax, shippingPrice, total } =
    useCartStore();
  const { user, isAuthenticated } = useAuth();
  const [activeStep, setActiveStep] = useState("shipping");
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [formData, setFormData] = useState({
    // Shipping info
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
    country: user?.address?.country || "United States",

    // Payment info
    cardName: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
    savePaymentInfo: false,
  });

  // Use the shipping price from the store
  const shipping = shippingPrice;

  useEffect(() => {
    // Redirect to cart if cart is empty
    if (cartItems.length === 0 && !orderSuccess) {
      navigate("/cart");
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate("/login?redirect=checkout");
    }
  }, [cartItems, isAuthenticated, navigate, orderSuccess]);

  // Fetch saved addresses
  useEffect(() => {
    const fetchAddresses = async () => {
      if (isAuthenticated) {
        try {
          setLoadingAddresses(true);
          const addresses = await getAddresses();
          setSavedAddresses(addresses);

          // Set default address if available
          const defaultAddress = addresses.find((addr) => addr.isDefault);
          if (defaultAddress) {
            setSelectedAddressId(defaultAddress._id);
            fillAddressForm(defaultAddress);
          }
        } catch (error) {
          console.error("Error fetching addresses:", error);
        } finally {
          setLoadingAddresses(false);
        }
      }
    };

    fetchAddresses();
  }, [isAuthenticated]);

  const fillAddressForm = (address) => {
    setFormData((prev) => ({
      ...prev,
      firstName: user?.name?.split(" ")[0] || "",
      lastName: user?.name?.split(" ").slice(1).join(" ") || "",
      email: user?.email || "",
      phone: address.phone || "",
      address: address.streetAddress || "",
      city: address.city || "",
      state: address.state || "",
      zipCode: address.zipCode || "",
      country: address.country || "United States",
    }));
  };

  const handleAddressSelect = (e) => {
    const addressId = e.target.value;
    setSelectedAddressId(addressId);

    if (addressId) {
      const selectedAddress = savedAddresses.find(
        (addr) => addr._id === addressId
      );
      if (selectedAddress) {
        fillAddressForm(selectedAddress);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });

    // Clear error when user types
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: "",
      });
    }
  };

  const validateForm = (step) => {
    const errors = {};

    if (step === "shipping") {
      if (!formData.firstName.trim())
        errors.firstName = "First name is required";
      if (!formData.lastName.trim()) errors.lastName = "Last name is required";
      if (!formData.email.trim()) errors.email = "Email is required";
      if (!formData.phone.trim()) errors.phone = "Phone number is required";
      if (!formData.address.trim()) errors.address = "Address is required";
      if (!formData.city.trim()) errors.city = "City is required";
      if (!formData.state.trim()) errors.state = "State is required";
      if (!formData.zipCode.trim()) errors.zipCode = "ZIP code is required";
    } else if (step === "payment") {
      if (!formData.cardName.trim())
        errors.cardName = "Name on card is required";
      if (!formData.cardNumber.trim())
        errors.cardNumber = "Card number is required";
      if (!formData.cardExpiry.trim())
        errors.cardExpiry = "Expiry date is required";
      if (!formData.cardCvc.trim()) errors.cardCvc = "CVC is required";

      // Validate card number format
      if (
        formData.cardNumber.trim() &&
        !/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ""))
      ) {
        errors.cardNumber = "Invalid card number";
      }

      // Validate expiry date format (MM/YY)
      if (
        formData.cardExpiry.trim() &&
        !/^\d{2}\/\d{2}$/.test(formData.cardExpiry)
      ) {
        errors.cardExpiry = "Use MM/YY format";
      }

      // Validate CVC format
      if (formData.cardCvc.trim() && !/^\d{3,4}$/.test(formData.cardCvc)) {
        errors.cardCvc = "Invalid CVC";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNextStep = () => {
    if (activeStep === "shipping" && validateForm("shipping")) {
      setActiveStep("payment");
    }
  };

  const handlePrevStep = () => {
    if (activeStep === "payment") {
      setActiveStep("shipping");
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    if (!validateForm("payment")) {
      return;
    }

    try {
      setIsSubmitting(true);

      const orderData = {
        orderItems: cartItems.map((item) => ({
          product: item._id,
          name: item.name,
          qty: item.quantity,
          image: item.image,
          price: item.price,
        })),
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          postalCode: formData.zipCode,
          country: formData.country,
        },
        paymentMethod: "Credit Card",
        itemsPrice: subtotal,
        taxPrice: tax,
        shippingPrice: shipping,
        totalPrice: total,
      };

      // Call order API
      const order = await createOrder(orderData);

      // Clear cart and show success
      clearCart();
      setOrderId(order._id);
      setOrderSuccess(true);
    } catch (error) {
      console.error("Error creating order:", error);
      setFormErrors({
        submit: "Failed to place order. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCardNumber = (value) => {
    // Remove non-digit characters
    const digitsOnly = value.replace(/\D/g, "");
    // Add space after every 4 digits
    const formatted = digitsOnly.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formatted;
  };

  if (orderSuccess) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-xl rounded-lg border border-border p-6 text-center">
          <div className="mb-6 flex justify-center">
            <div className="rounded-full bg-green-100 p-3">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-12 w-12 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
          </div>
          <h1 className="mb-2 text-2xl font-bold">
            Order Placed Successfully!
          </h1>
          <p className="mb-6 text-muted-foreground">
            Thank you for your order. We've received your order and will begin
            processing it soon.
          </p>
          <div className="mb-6 rounded-md bg-muted p-4 text-left">
            <p className="mb-2 font-medium">
              Order Number: <span className="font-normal">{orderId}</span>
            </p>
            <p className="font-medium">
              Total Amount:{" "}
              <span className="font-normal">${total.toFixed(2)}</span>
            </p>
          </div>
          <p className="mb-6 text-sm text-muted-foreground">
            A confirmation email has been sent to{" "}
            <span className="font-medium">{formData.email}</span>
          </p>
          <div className="flex justify-center space-x-4">
            <Button onClick={() => navigate("/products")}>
              Continue Shopping
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate("/dashboard/orders")}
            >
              View Your Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Checkout</h1>

      {/* Checkout Steps */}
      <div className="mb-8 flex items-center justify-center">
        <div className="flex w-full max-w-2xl items-center">
          <div
            className={`flex flex-1 flex-col items-center ${
              activeStep === "shipping"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                activeStep === "shipping"
                  ? "border-primary bg-primary text-white"
                  : "border-muted-foreground bg-background"
              }`}
            >
              1
            </div>
            <span className="mt-1 text-xs font-medium sm:text-sm">
              Shipping
            </span>
          </div>

          <div
            className={`h-1 w-20 ${
              activeStep === "payment" ? "bg-primary" : "bg-muted"
            }`}
          />

          <div
            className={`flex flex-1 flex-col items-center ${
              activeStep === "payment"
                ? "text-primary"
                : "text-muted-foreground"
            }`}
          >
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                activeStep === "payment"
                  ? "border-primary bg-primary text-white"
                  : "border-muted-foreground bg-background"
              }`}
            >
              2
            </div>
            <span className="mt-1 text-xs font-medium sm:text-sm">Payment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Form Section */}
        <div className="lg:col-span-8">
          <div className="rounded-lg border border-border p-6">
            {activeStep === "shipping" && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-6 text-xl font-bold">Shipping Information</h2>

                {/* Saved Addresses Dropdown */}
                {savedAddresses.length > 0 && (
                  <div className="mb-6">
                    <FormGroup>
                      <FormLabel>Use Saved Address</FormLabel>
                      <div className="flex items-center space-x-2">
                        <div className="relative flex-grow">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                            <FiMapPin className="h-5 w-5" />
                          </div>
                          <select
                            className="w-full appearance-none rounded-md border border-input bg-background py-2 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                            value={selectedAddressId || ""}
                            onChange={handleAddressSelect}
                            disabled={loadingAddresses}
                          >
                            <option value="">-- Select an address --</option>
                            {savedAddresses.map((address) => (
                              <option key={address._id} value={address._id}>
                                {address.name} ({address.streetAddress},{" "}
                                {address.city})
                                {address.isDefault ? " (Default)" : ""}
                              </option>
                            ))}
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                            <FiChevronRight className="h-5 w-5 transform rotate-90 text-muted-foreground" />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => navigate("/dashboard/address")}
                        >
                          Manage
                        </Button>
                      </div>
                    </FormGroup>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormGroup>
                    <FormLabel>First Name</FormLabel>
                    <Input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      className={formErrors.firstName ? "border-red-500" : ""}
                    />
                    {formErrors.firstName && (
                      <FormMessage>{formErrors.firstName}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Last Name</FormLabel>
                    <Input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      className={formErrors.lastName ? "border-red-500" : ""}
                    />
                    {formErrors.lastName && (
                      <FormMessage>{formErrors.lastName}</FormMessage>
                    )}
                  </FormGroup>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <FormGroup>
                    <FormLabel>Email Address</FormLabel>
                    <Input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={formErrors.email ? "border-red-500" : ""}
                    />
                    {formErrors.email && (
                      <FormMessage>{formErrors.email}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Phone Number</FormLabel>
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={formErrors.phone ? "border-red-500" : ""}
                    />
                    {formErrors.phone && (
                      <FormMessage>{formErrors.phone}</FormMessage>
                    )}
                  </FormGroup>
                </div>

                <FormGroup>
                  <FormLabel>Street Address</FormLabel>
                  <Input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className={formErrors.address ? "border-red-500" : ""}
                  />
                  {formErrors.address && (
                    <FormMessage>{formErrors.address}</FormMessage>
                  )}
                </FormGroup>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <FormGroup>
                    <FormLabel>City</FormLabel>
                    <Input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={formErrors.city ? "border-red-500" : ""}
                    />
                    {formErrors.city && (
                      <FormMessage>{formErrors.city}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>State</FormLabel>
                    <Input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleInputChange}
                      className={formErrors.state ? "border-red-500" : ""}
                    />
                    {formErrors.state && (
                      <FormMessage>{formErrors.state}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>ZIP Code</FormLabel>
                    <Input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleInputChange}
                      className={formErrors.zipCode ? "border-red-500" : ""}
                    />
                    {formErrors.zipCode && (
                      <FormMessage>{formErrors.zipCode}</FormMessage>
                    )}
                  </FormGroup>
                </div>

                <FormGroup>
                  <FormLabel>Country</FormLabel>
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                    <option value="France">France</option>
                  </select>
                </FormGroup>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={handleNextStep}
                    className="flex items-center"
                  >
                    Continue to Payment{" "}
                    <FiChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {activeStep === "payment" && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <h2 className="mb-6 text-xl font-bold">Payment Information</h2>

                <div className="mb-6 flex items-center rounded-md bg-muted p-3 text-sm">
                  <FiLock className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>
                    Your payment information is secured with SSL encryption
                  </span>
                </div>

                <form onSubmit={handlePlaceOrder}>
                  <FormGroup>
                    <FormLabel>Name on Card</FormLabel>
                    <Input
                      type="text"
                      name="cardName"
                      value={formData.cardName}
                      onChange={handleInputChange}
                      className={formErrors.cardName ? "border-red-500" : ""}
                    />
                    {formErrors.cardName && (
                      <FormMessage>{formErrors.cardName}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Card Number</FormLabel>
                    <div className="relative">
                      <Input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setFormData({
                            ...formData,
                            cardNumber: formatted,
                          });
                          if (formErrors.cardNumber) {
                            setFormErrors({
                              ...formErrors,
                              cardNumber: "",
                            });
                          }
                        }}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className={
                          formErrors.cardNumber
                            ? "border-red-500 pr-10"
                            : "pr-10"
                        }
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <FiCreditCard className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                    {formErrors.cardNumber && (
                      <FormMessage>{formErrors.cardNumber}</FormMessage>
                    )}
                  </FormGroup>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormGroup>
                      <FormLabel>Expiry Date</FormLabel>
                      <Input
                        type="text"
                        name="cardExpiry"
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={
                          formErrors.cardExpiry ? "border-red-500" : ""
                        }
                      />
                      {formErrors.cardExpiry && (
                        <FormMessage>{formErrors.cardExpiry}</FormMessage>
                      )}
                    </FormGroup>

                    <FormGroup>
                      <FormLabel>CVC</FormLabel>
                      <Input
                        type="text"
                        name="cardCvc"
                        value={formData.cardCvc}
                        onChange={handleInputChange}
                        placeholder="123"
                        maxLength={4}
                        className={formErrors.cardCvc ? "border-red-500" : ""}
                      />
                      {formErrors.cardCvc && (
                        <FormMessage>{formErrors.cardCvc}</FormMessage>
                      )}
                    </FormGroup>
                  </div>

                  <div className="mt-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="savePaymentInfo"
                        checked={formData.savePaymentInfo}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      <span className="ml-2 text-sm">
                        Save my payment information for future purchases
                      </span>
                    </label>
                  </div>

                  {formErrors.submit && (
                    <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
                      {formErrors.submit}
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handlePrevStep}
                    >
                      Back to Shipping
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center"
                    >
                      {isSubmitting ? "Processing..." : "Place Order"}
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div className="rounded-lg border border-border p-4">
            <h2 className="mb-4 text-lg font-bold">Order Summary</h2>

            <div className="max-h-60 overflow-auto">
              {cartItems.map((item) => (
                <div
                  key={item._id}
                  className="mb-3 flex items-start border-b border-border pb-3 last:border-0"
                >
                  <div className="mr-3 h-14 w-14 flex-shrink-0 overflow-hidden rounded-md border border-border">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex-grow">
                    <p className="line-clamp-1 font-medium">{item.name}</p>
                    <div className="flex justify-between">
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                      <p className="font-medium">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-2 border-b border-border py-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                {shipping === 0 ? (
                  <span className="text-green-600">Free</span>
                ) : (
                  <span>${shipping.toFixed(2)}</span>
                )}
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${tax.toFixed(2)}</span>
              </div>
            </div>

            <div className="my-4 flex justify-between font-bold">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
