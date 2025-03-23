import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FiMapPin, FiPlus, FiTrash2, FiEdit2 } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../../components/ui/Form";

const Address = () => {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();

  // Mock fetch addresses (would be API call in production)
  useEffect(() => {
    // In a real app, fetch addresses from API
    setAddresses([
      {
        id: 1,
        name: "Home",
        streetAddress: "123 Main St",
        city: "New York",
        state: "NY",
        zipCode: "10001",
        country: "United States",
        isDefault: true,
        phone: "+1 (555) 123-4567",
      },
      {
        id: 2,
        name: "Office",
        streetAddress: "456 Business Ave",
        city: "Chicago",
        state: "IL",
        zipCode: "60601",
        country: "United States",
        isDefault: false,
        phone: "+1 (555) 987-6543",
      },
    ]);
  }, []);

  const onSubmit = (data) => {
    setLoading(true);

    try {
      if (editingIndex !== null) {
        // Update existing address
        const updatedAddresses = [...addresses];
        updatedAddresses[editingIndex] = {
          ...updatedAddresses[editingIndex],
          ...data,
        };

        // If new default is set, update all others
        if (data.isDefault) {
          updatedAddresses.forEach((addr, index) => {
            if (index !== editingIndex) {
              addr.isDefault = false;
            }
          });
        }

        setAddresses(updatedAddresses);
        toast.success("Address updated successfully");
      } else {
        // Add new address
        const newAddress = {
          id: Date.now(),
          ...data,
        };

        // If new default is set, update all others
        if (data.isDefault) {
          setAddresses(
            addresses.map((addr) => ({
              ...addr,
              isDefault: false,
            }))
          );
        }

        setAddresses([...addresses, newAddress]);
        toast.success("Address added successfully");
      }
    } catch (error) {
      toast.error("Error saving address");
      console.error(error);
    } finally {
      setLoading(false);
      setIsAddingNew(false);
      setEditingIndex(null);
      reset();
    }
  };

  const handleEdit = (index) => {
    const address = addresses[index];
    Object.keys(address).forEach((key) => {
      setValue(key, address[key]);
    });
    setEditingIndex(index);
    setIsAddingNew(true);
  };

  const handleDelete = (index) => {
    const updatedAddresses = addresses.filter((_, idx) => idx !== index);
    setAddresses(updatedAddresses);
    toast.success("Address removed");
  };

  const handleSetDefault = (index) => {
    const updatedAddresses = addresses.map((address, idx) => ({
      ...address,
      isDefault: idx === index,
    }));
    setAddresses(updatedAddresses);
    toast.success("Default address updated");
  };

  const cancelForm = () => {
    setIsAddingNew(false);
    setEditingIndex(null);
    reset();
  };

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        {!isAddingNew && (
          <Button onClick={() => setIsAddingNew(true)} size="sm">
            <FiPlus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        )}
      </div>

      {isAddingNew ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-4 text-xl font-semibold">
            {editingIndex !== null ? "Edit Address" : "Add New Address"}
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FormGroup>
                <FormLabel htmlFor="name">Address Name</FormLabel>
                <input
                  id="name"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.name ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="Home, Office, etc."
                  {...register("name", {
                    required: "Address name is required",
                  })}
                />
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="phone">Phone Number</FormLabel>
                <input
                  id="phone"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.phone ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="+1 (555) 123-4567"
                  {...register("phone", {
                    required: "Phone number is required",
                  })}
                />
                {errors.phone && (
                  <FormMessage>{errors.phone.message}</FormMessage>
                )}
              </FormGroup>
            </div>

            <FormGroup>
              <FormLabel htmlFor="streetAddress">Street Address</FormLabel>
              <input
                id="streetAddress"
                type="text"
                className={`w-full rounded-md border ${
                  errors.streetAddress ? "border-destructive" : "border-input"
                } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                placeholder="123 Main St"
                {...register("streetAddress", {
                  required: "Street address is required",
                })}
              />
              {errors.streetAddress && (
                <FormMessage>{errors.streetAddress.message}</FormMessage>
              )}
            </FormGroup>

            <div className="grid gap-4 md:grid-cols-2">
              <FormGroup>
                <FormLabel htmlFor="city">City</FormLabel>
                <input
                  id="city"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.city ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="New York"
                  {...register("city", { required: "City is required" })}
                />
                {errors.city && (
                  <FormMessage>{errors.city.message}</FormMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="state">State/Province</FormLabel>
                <input
                  id="state"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.state ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="NY"
                  {...register("state", { required: "State is required" })}
                />
                {errors.state && (
                  <FormMessage>{errors.state.message}</FormMessage>
                )}
              </FormGroup>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <FormGroup>
                <FormLabel htmlFor="zipCode">ZIP/Postal Code</FormLabel>
                <input
                  id="zipCode"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.zipCode ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="10001"
                  {...register("zipCode", { required: "ZIP code is required" })}
                />
                {errors.zipCode && (
                  <FormMessage>{errors.zipCode.message}</FormMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="country">Country</FormLabel>
                <input
                  id="country"
                  type="text"
                  className={`w-full rounded-md border ${
                    errors.country ? "border-destructive" : "border-input"
                  } bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="United States"
                  {...register("country", { required: "Country is required" })}
                />
                {errors.country && (
                  <FormMessage>{errors.country.message}</FormMessage>
                )}
              </FormGroup>
            </div>

            <FormGroup>
              <div className="flex items-center">
                <input
                  id="isDefault"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("isDefault")}
                />
                <FormLabel htmlFor="isDefault" className="ml-2">
                  Set as default address
                </FormLabel>
              </div>
            </FormGroup>

            <div className="flex space-x-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>Saving...</>
                ) : editingIndex !== null ? (
                  <>Update Address</>
                ) : (
                  <>Save Address</>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={cancelForm}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      ) : null}

      {addresses.length === 0 && !isAddingNew ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-border py-16 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <FiMapPin className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="mb-2 text-xl font-semibold">No Addresses Found</h2>
          <p className="mb-6 max-w-md text-muted-foreground">
            You haven't added any addresses yet. Add your first address to make
            checkout easier.
          </p>
          <Button onClick={() => setIsAddingNew(true)}>
            <FiPlus className="mr-2 h-4 w-4" />
            Add New Address
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-card p-6 shadow-sm"
            >
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-lg font-medium">{address.name}</span>
                  {address.isDefault && (
                    <span className="ml-2 rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                      Default
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(index)}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
                  >
                    <FiEdit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(index)}
                    className="rounded-full p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                  >
                    <FiTrash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4 space-y-1 text-sm text-muted-foreground">
                <p>{address.streetAddress}</p>
                <p>
                  {address.city}, {address.state} {address.zipCode}
                </p>
                <p>{address.country}</p>
                <p className="pt-2">{address.phone}</p>
              </div>

              {!address.isDefault && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleSetDefault(index)}
                >
                  Set as Default
                </Button>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Address;
