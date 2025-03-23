import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";
import { FormGroup, FormLabel, FormMessage } from "../components/ui/Form";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirect = location.search ? location.search.split("=")[1] : "/";

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const name = data.email.split("@")[0];
      await login(data.email, data.password, name);
      navigate(redirect);
    } catch (error) {
      console.error("Login failed:", error);
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
              <h1 className="text-3xl font-bold">Welcome Back</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in to your account to continue
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    Remember me
                  </span>
                </label>
                <a
                  href="#"
                  className="text-sm font-medium text-primary hover:text-primary/90"
                >
                  Forgot password?
                </a>
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link
                  to={redirect ? `/register?redirect=${redirect}` : "/register"}
                  className="font-semibold text-primary hover:text-primary/90"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
