import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../components/ui/Form";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { register: registerUser } = useAuth();

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      await registerUser(data.name, data.email, data.password);
      navigate(redirect);
    } catch (error) {
      console.error("Registration failed:", error);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <div className="mx-auto max-w-md">
        <motion.div
          className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold">Create an Account</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign up to get started with our service
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <FormGroup>
                <FormLabel htmlFor="name">Full Name</FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <FiUser className="h-5 w-5" />
                  </div>
                  <input
                    id="name"
                    type="text"
                    className={`w-full rounded-md border ${
                      errors.name ? "border-destructive" : "border-input"
                    } bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="John Doe"
                    {...register("name", {
                      required: "Name is required",
                      minLength: {
                        value: 2,
                        message: "Name must be at least 2 characters",
                      },
                    })}
                  />
                </div>
                {errors.name && (
                  <FormMessage>{errors.name.message}</FormMessage>
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
                      errors.email ? "border-destructive" : "border-input"
                    } bg-background pl-10 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="you@example.com"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Please enter a valid email",
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <FormMessage>{errors.email.message}</FormMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="password">Password</FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`w-full rounded-md border ${
                      errors.password ? "border-destructive" : "border-input"
                    } bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="••••••••"
                    {...register("password", {
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Password must be at least 6 characters",
                      },
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
                {errors.password && (
                  <FormMessage>{errors.password.message}</FormMessage>
                )}
              </FormGroup>

              <FormGroup>
                <FormLabel htmlFor="confirmPassword">
                  Confirm Password
                </FormLabel>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                    <FiLock className="h-5 w-5" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    className={`w-full rounded-md border ${
                      errors.confirmPassword
                        ? "border-destructive"
                        : "border-input"
                    } bg-background pl-10 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring`}
                    placeholder="••••••••"
                    {...register("confirmPassword", {
                      required: "Please confirm your password",
                      validate: (value) =>
                        value === password || "Passwords do not match",
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
                {errors.confirmPassword && (
                  <FormMessage>{errors.confirmPassword.message}</FormMessage>
                )}
              </FormGroup>

              <div className="flex items-center space-x-2">
                <input
                  id="terms"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  {...register("terms", {
                    required: "You must agree to the terms and conditions",
                  })}
                />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  I agree to the{" "}
                  <a href="#" className="text-primary hover:text-primary/90">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-primary hover:text-primary/90">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && (
                <FormMessage>{errors.terms.message}</FormMessage>
              )}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link
                  to={redirect ? `/login?redirect=${redirect}` : "/login"}
                  className="font-semibold text-primary hover:text-primary/90"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
