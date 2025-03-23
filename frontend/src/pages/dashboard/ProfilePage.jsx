import { useState, useEffect } from "react";
import { FiUser, FiEdit2, FiSave, FiX, FiShield } from "react-icons/fi";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { FormGroup, FormLabel, FormMessage } from "../../components/ui/Form";

const ProfilePage = () => {
  const { user, updateProfile, updatePassword, loading, error } = useAuth();

  const [personalInfo, setPersonalInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const [address, setAddress] = useState({
    street: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

  const [password, setPassword] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [editMode, setEditMode] = useState({
    personal: false,
    address: false,
    password: false,
  });

  const [formErrors, setFormErrors] = useState({});
  const [updateSuccess, setUpdateSuccess] = useState({
    personal: false,
    address: false,
    password: false,
  });

  useEffect(() => {
    if (user) {
      setPersonalInfo({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
      });

      if (user.address) {
        setAddress({
          street: user.address.street || "",
          city: user.address.city || "",
          state: user.address.state || "",
          zipCode: user.address.zipCode || "",
          country: user.address.country || "United States",
        });
      }
    }
  }, [user]);

  const toggleEditMode = (section) => {
    setEditMode({ ...editMode, [section]: !editMode[section] });
    setFormErrors({});

    // Reset form when canceling edit
    if (editMode[section]) {
      if (section === "personal") {
        setPersonalInfo({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          email: user.email || "",
          phone: user.phone || "",
        });
      } else if (section === "address") {
        setAddress({
          street: user.address?.street || "",
          city: user.address?.city || "",
          state: user.address?.state || "",
          zipCode: user.address?.zipCode || "",
          country: user.address?.country || "United States",
        });
      } else if (section === "password") {
        setPassword({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    }
  };

  const handlePersonalInfoChange = (e) => {
    const { name, value } = e.target;
    setPersonalInfo({ ...personalInfo, [name]: value });

    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setAddress({ ...address, [name]: value });

    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPassword({ ...password, [name]: value });

    // Clear error when typing
    if (formErrors[name]) {
      setFormErrors({ ...formErrors, [name]: "" });
    }
  };

  const validatePersonalInfo = () => {
    const errors = {};

    if (!personalInfo.firstName.trim()) {
      errors.firstName = "First name is required";
    }

    if (!personalInfo.lastName.trim()) {
      errors.lastName = "Last name is required";
    }

    if (!personalInfo.email.trim()) {
      errors.email = "Email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(personalInfo.email)) {
      errors.email = "Invalid email address";
    }

    if (!personalInfo.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateAddress = () => {
    const errors = {};

    if (!address.street.trim()) {
      errors.street = "Street address is required";
    }

    if (!address.city.trim()) {
      errors.city = "City is required";
    }

    if (!address.state.trim()) {
      errors.state = "State is required";
    }

    if (!address.zipCode.trim()) {
      errors.zipCode = "ZIP code is required";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validatePassword = () => {
    const errors = {};

    if (!password.currentPassword.trim()) {
      errors.currentPassword = "Current password is required";
    }

    if (!password.newPassword.trim()) {
      errors.newPassword = "New password is required";
    } else if (password.newPassword.length < 6) {
      errors.newPassword = "Password must be at least 6 characters";
    }

    if (!password.confirmPassword.trim()) {
      errors.confirmPassword = "Please confirm your password";
    } else if (password.newPassword !== password.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdatePersonalInfo = async () => {
    if (!validatePersonalInfo()) return;

    try {
      await updateProfile({
        firstName: personalInfo.firstName,
        lastName: personalInfo.lastName,
        email: personalInfo.email,
        phone: personalInfo.phone,
      });

      setUpdateSuccess({ ...updateSuccess, personal: true });
      setTimeout(() => {
        setUpdateSuccess({ ...updateSuccess, personal: false });
      }, 3000);

      setEditMode({ ...editMode, personal: false });
    } catch (err) {
      console.error("Error updating profile:", err);
      setFormErrors({
        ...formErrors,
        submit: err.message || "Failed to update profile",
      });
    }
  };

  const handleUpdateAddress = async () => {
    if (!validateAddress()) return;

    try {
      await updateProfile({
        address: {
          street: address.street,
          city: address.city,
          state: address.state,
          zipCode: address.zipCode,
          country: address.country,
        },
      });

      setUpdateSuccess({ ...updateSuccess, address: true });
      setTimeout(() => {
        setUpdateSuccess({ ...updateSuccess, address: false });
      }, 3000);

      setEditMode({ ...editMode, address: false });
    } catch (err) {
      console.error("Error updating address:", err);
      setFormErrors({
        ...formErrors,
        submit: err.message || "Failed to update address",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!validatePassword()) return;

    try {
      await updatePassword(password.currentPassword, password.newPassword);

      setUpdateSuccess({ ...updateSuccess, password: true });
      setTimeout(() => {
        setUpdateSuccess({ ...updateSuccess, password: false });
      }, 3000);

      setPassword({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setEditMode({ ...editMode, password: false });
    } catch (err) {
      console.error("Error updating password:", err);
      setFormErrors({
        ...formErrors,
        currentPassword: "Current password is incorrect",
      });
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-8 text-2xl font-bold">My Profile</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Personal Information */}
        <div className="rounded-lg border border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <FiUser className="h-5 w-5" />
              </div>
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleEditMode("personal")}
              className="text-muted-foreground hover:text-foreground"
            >
              {editMode.personal ? (
                <FiX className="h-4 w-4" />
              ) : (
                <FiEdit2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {updateSuccess.personal && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600"
            >
              Personal information updated successfully!
            </motion.div>
          )}

          {editMode.personal ? (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormGroup>
                  <FormLabel>First Name</FormLabel>
                  <Input
                    type="text"
                    name="firstName"
                    value={personalInfo.firstName}
                    onChange={handlePersonalInfoChange}
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
                    value={personalInfo.lastName}
                    onChange={handlePersonalInfoChange}
                    className={formErrors.lastName ? "border-red-500" : ""}
                  />
                  {formErrors.lastName && (
                    <FormMessage>{formErrors.lastName}</FormMessage>
                  )}
                </FormGroup>
              </div>

              <FormGroup>
                <FormLabel>Email Address</FormLabel>
                <Input
                  type="email"
                  name="email"
                  value={personalInfo.email}
                  onChange={handlePersonalInfoChange}
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
                  value={personalInfo.phone}
                  onChange={handlePersonalInfoChange}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <FormMessage>{formErrors.phone}</FormMessage>
                )}
              </FormGroup>

              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => toggleEditMode("personal")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdatePersonalInfo}
                  disabled={loading}
                  className="flex items-center"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">First Name</p>
                  <p className="font-medium">{personalInfo.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Last Name</p>
                  <p className="font-medium">{personalInfo.lastName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Email Address</p>
                <p className="font-medium">{personalInfo.email}</p>
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Phone Number</p>
                <p className="font-medium">
                  {personalInfo.phone || "Not provided"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Address Information */}
        <div className="rounded-lg border border-border p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold">Address Information</h2>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggleEditMode("address")}
              className="text-muted-foreground hover:text-foreground"
            >
              {editMode.address ? (
                <FiX className="h-4 w-4" />
              ) : (
                <FiEdit2 className="h-4 w-4" />
              )}
            </Button>
          </div>

          {updateSuccess.address && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600"
            >
              Address information updated successfully!
            </motion.div>
          )}

          {editMode.address ? (
            <>
              <FormGroup>
                <FormLabel>Street Address</FormLabel>
                <Input
                  type="text"
                  name="street"
                  value={address.street}
                  onChange={handleAddressChange}
                  className={formErrors.street ? "border-red-500" : ""}
                />
                {formErrors.street && (
                  <FormMessage>{formErrors.street}</FormMessage>
                )}
              </FormGroup>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormGroup>
                  <FormLabel>City</FormLabel>
                  <Input
                    type="text"
                    name="city"
                    value={address.city}
                    onChange={handleAddressChange}
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
                    value={address.state}
                    onChange={handleAddressChange}
                    className={formErrors.state ? "border-red-500" : ""}
                  />
                  {formErrors.state && (
                    <FormMessage>{formErrors.state}</FormMessage>
                  )}
                </FormGroup>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormGroup>
                  <FormLabel>ZIP Code</FormLabel>
                  <Input
                    type="text"
                    name="zipCode"
                    value={address.zipCode}
                    onChange={handleAddressChange}
                    className={formErrors.zipCode ? "border-red-500" : ""}
                  />
                  {formErrors.zipCode && (
                    <FormMessage>{formErrors.zipCode}</FormMessage>
                  )}
                </FormGroup>

                <FormGroup>
                  <FormLabel>Country</FormLabel>
                  <select
                    name="country"
                    value={address.country}
                    onChange={handleAddressChange}
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
              </div>

              <div className="mt-4 flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => toggleEditMode("address")}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpdateAddress}
                  disabled={loading}
                  className="flex items-center"
                >
                  <FiSave className="mr-2 h-4 w-4" />
                  {loading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              {user.address ? (
                <>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      Street Address
                    </p>
                    <p className="font-medium">{address.street}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">City</p>
                      <p className="font-medium">{address.city}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">State</p>
                      <p className="font-medium">{address.state}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-sm text-muted-foreground">ZIP Code</p>
                      <p className="font-medium">{address.zipCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Country</p>
                      <p className="font-medium">{address.country}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="rounded-md bg-muted p-4 text-center text-muted-foreground">
                  <p>No address information provided yet.</p>
                  <Button
                    onClick={() => toggleEditMode("address")}
                    variant="outline"
                    className="mt-2"
                    size="sm"
                  >
                    Add Address
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Password Update */}
        <div className="md:col-span-2">
          <div className="rounded-lg border border-border p-6">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center">
                <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <FiShield className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-semibold">Password</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleEditMode("password")}
                className="text-muted-foreground hover:text-foreground"
              >
                {editMode.password ? (
                  <FiX className="h-4 w-4" />
                ) : (
                  <FiEdit2 className="h-4 w-4" />
                )}
              </Button>
            </div>

            {updateSuccess.password && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-md bg-green-50 p-3 text-sm text-green-600"
              >
                Password updated successfully!
              </motion.div>
            )}

            {editMode.password ? (
              <>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <FormGroup>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      name="currentPassword"
                      value={password.currentPassword}
                      onChange={handlePasswordChange}
                      className={
                        formErrors.currentPassword ? "border-red-500" : ""
                      }
                    />
                    {formErrors.currentPassword && (
                      <FormMessage>{formErrors.currentPassword}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      name="newPassword"
                      value={password.newPassword}
                      onChange={handlePasswordChange}
                      className={formErrors.newPassword ? "border-red-500" : ""}
                    />
                    {formErrors.newPassword && (
                      <FormMessage>{formErrors.newPassword}</FormMessage>
                    )}
                  </FormGroup>

                  <FormGroup>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      name="confirmPassword"
                      value={password.confirmPassword}
                      onChange={handlePasswordChange}
                      className={
                        formErrors.confirmPassword ? "border-red-500" : ""
                      }
                    />
                    {formErrors.confirmPassword && (
                      <FormMessage>{formErrors.confirmPassword}</FormMessage>
                    )}
                  </FormGroup>
                </div>

                <div className="mt-4 flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => toggleEditMode("password")}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdatePassword}
                    disabled={loading}
                    className="flex items-center"
                  >
                    <FiSave className="mr-2 h-4 w-4" />
                    {loading ? "Saving..." : "Update Password"}
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-between rounded-md bg-muted p-4">
                <div className="flex items-center">
                  <div className="mr-3 h-8 w-8 rounded-full bg-muted-foreground/20 p-1.5 text-muted-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-full w-full"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Last updated:{" "}
                      {user.passwordUpdatedAt
                        ? new Date(user.passwordUpdatedAt).toLocaleDateString()
                        : "Never"}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => toggleEditMode("password")}
                  variant="outline"
                  size="sm"
                >
                  Change Password
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
