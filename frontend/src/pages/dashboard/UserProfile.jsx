import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../../components/ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../../components/ui/Form";

const UserProfile = () => {
  const { user, updateProfile } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isEditing, setIsEditing] = useState({
    personal: false,
    password: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerPersonal,
    handleSubmit: handleSubmitPersonal,
    formState: { errors: errorsPersonal },
    reset: resetPersonal,
  } = useForm({
    defaultValues: {
      name: user?.name || "",
      email: user?.email || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: errorsPassword },
    reset: resetPassword,
    watch,
  } = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const newPassword = watch("newPassword", "");

  const onSubmitPersonal = async (data) => {
    setIsSubmitting(true);
    try {
      await updateProfile({
        ...user,
        name: data.name,
        email: data.email,
      });

      toast.success("Profile updated successfully");
      setIsEditing({ ...isEditing, personal: false });
    } catch (error) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data) => {
    setIsSubmitting(true);
    try {
      // In a real app, you'd send the current password for verification
      // and the new password to update
      await updateProfile({
        ...user,
        password: data.newPassword,
      });

      toast.success("Password updated successfully");
      setIsEditing({ ...isEditing, password: false });
      resetPassword();
    } catch (error) {
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = (section) => {
    if (section === "personal") {
      resetPersonal({
        name: user?.name || "",
        email: user?.email || "",
      });
    } else if (section === "password") {
      resetPassword();
    }

    setIsEditing({ ...isEditing, [section]: false });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="mb-6 text-2xl font-bold">My Profile</h1>

      {/* Personal Information Section */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Personal Information</h2>
          {!isEditing.personal ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing({ ...isEditing, personal: true })}
            >
              Edit
            </Button>
          ) : null}
        </div>

        {!isEditing.personal ? (
          <div className="space-y-4">
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Name
              </span>
              <span className="text-foreground">{user?.name}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-sm font-medium text-muted-foreground">
                Email
              </span>
              <span className="text-foreground">{user?.email}</span>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmitPersonal(onSubmitPersonal)}
            className="space-y-4"
          >
            <FormGroup>
              <FormLabel htmlFor="name">Name</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <FiUser className="h-5 w-5" />
                </div>
                <input
                  id="name"
                  type="text"
                  className={`w-full rounded-md border ${
                    errorsPersonal.name ? "border-destructive" : "border-input"
                  } bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="John Doe"
                  {...registerPersonal("name", {
                    required: "Name is required",
                    minLength: {
                      value: 2,
                      message: "Name must be at least 2 characters",
                    },
                  })}
                />
              </div>
              {errorsPersonal.name && (
                <FormMessage>{errorsPersonal.name.message}</FormMessage>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="email">Email</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <FiMail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  className={`w-full rounded-md border ${
                    errorsPersonal.email ? "border-destructive" : "border-input"
                  } bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="you@example.com"
                  {...registerPersonal("email", {
                    required: "Email is required",
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: "Please enter a valid email",
                    },
                  })}
                />
              </div>
              {errorsPersonal.email && (
                <FormMessage>{errorsPersonal.email.message}</FormMessage>
              )}
            </FormGroup>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cancelEdit("personal")}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password Section */}
      <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Change Password</h2>
          {!isEditing.password ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing({ ...isEditing, password: true })}
            >
              Change Password
            </Button>
          ) : null}
        </div>

        {isEditing.password && (
          <form
            onSubmit={handleSubmitPassword(onSubmitPassword)}
            className="space-y-4"
          >
            <FormGroup>
              <FormLabel htmlFor="currentPassword">Current Password</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="currentPassword"
                  type={showPassword ? "text" : "password"}
                  className={`w-full rounded-md border ${
                    errorsPassword.currentPassword
                      ? "border-destructive"
                      : "border-input"
                  } bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="••••••••"
                  {...registerPassword("currentPassword", {
                    required: "Current password is required",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errorsPassword.currentPassword && (
                <FormMessage>
                  {errorsPassword.currentPassword.message}
                </FormMessage>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="newPassword">New Password</FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  className={`w-full rounded-md border ${
                    errorsPassword.newPassword
                      ? "border-destructive"
                      : "border-input"
                  } bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="••••••••"
                  {...registerPassword("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errorsPassword.newPassword && (
                <FormMessage>{errorsPassword.newPassword.message}</FormMessage>
              )}
            </FormGroup>

            <FormGroup>
              <FormLabel htmlFor="confirmPassword">
                Confirm New Password
              </FormLabel>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                  <FiLock className="h-5 w-5" />
                </div>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  className={`w-full rounded-md border ${
                    errorsPassword.confirmPassword
                      ? "border-destructive"
                      : "border-input"
                  } bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                  placeholder="••••••••"
                  {...registerPassword("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FiEyeOff className="h-5 w-5" />
                  ) : (
                    <FiEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errorsPassword.confirmPassword && (
                <FormMessage>
                  {errorsPassword.confirmPassword.message}
                </FormMessage>
              )}
            </FormGroup>

            <div className="flex space-x-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Password"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => cancelEdit("password")}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
