import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { motion } from "framer-motion";
import { FiMail, FiLock, FiEye, FiEyeOff, FiLogIn } from "react-icons/fi";
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
      await login(data.email, data.password);
      navigate(redirect);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] bg-pink-gradient flex items-center justify-center py-16 px-4">
      <div className="w-full max-w-md relative">
        {/* Decorative elements */}
        <div className="absolute -top-10 -left-10 w-20 h-20 rounded-full bg-primary/10 z-0"></div>
        <div className="absolute -bottom-10 -right-10 w-20 h-20 rounded-full bg-primary/10 z-0"></div>
        <div className="absolute top-1/4 -right-5 w-10 h-10 rounded-full bg-primary/10 z-0"></div>
        <div className="absolute bottom-1/3 -left-5 w-10 h-10 rounded-full bg-primary/10 z-0"></div>

        <motion.div
          className="overflow-hidden rounded-xl border border-border/40 bg-white shadow-soft relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-24 h-24 bg-primary/5 rounded-br-full"></div>
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/5 rounded-tl-full"></div>

            <div className="relative p-8">
              <div className="mb-8 text-center">
                <div className="flex justify-center mb-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <FiLogIn className="h-8 w-8 text-primary" />
                  </div>
                </div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
                  Welcome Back
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to your account to continue
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                <FormGroup>
                  <FormLabel htmlFor="email" className="text-sm font-medium">
                    Email
                  </FormLabel>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <FiMail className="h-5 w-5" />
                    </div>
                    <input
                      id="email"
                      type="email"
                      className={`w-full rounded-lg border ${
                        errors.email ? "border-destructive" : "border-input/50"
                      } bg-background/60 pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200`}
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
                  <div className="flex items-center justify-between">
                    <FormLabel
                      htmlFor="password"
                      className="text-sm font-medium"
                    >
                      Password
                    </FormLabel>
                    <a
                      href="#"
                      className="text-xs font-medium text-primary hover:text-primary/90 transition-colors duration-200"
                    >
                      Forgot password?
                    </a>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
                      <FiLock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className={`w-full rounded-lg border ${
                        errors.password
                          ? "border-destructive"
                          : "border-input/50"
                      } bg-background/60 pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200`}
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
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors duration-200"
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

                <div className="flex items-center">
                  <label className="flex items-center space-x-2 text-sm">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="text-muted-foreground">Remember me</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 font-medium shadow-soft hover:shadow-md hover:translate-y-[-1px]"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/40"></div>
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-lg border border-border/40 bg-white px-3 py-2.5 text-sm font-medium hover:bg-secondary/30 transition-all duration-200 shadow-soft"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                      <path d="M1 1h22v22H1z" fill="none" />
                    </svg>
                    Google
                  </button>
                  <button
                    type="button"
                    className="flex items-center justify-center rounded-lg border border-border/40 bg-white px-3 py-2.5 text-sm font-medium hover:bg-secondary/30 transition-all duration-200 shadow-soft"
                  >
                    <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                      <path d="M12 2.04c-5.5 0-10 4.49-10 10.02 0 5.52 4.5 10.02 10 10.02 5.5 0 10-4.5 10-10.02 0-5.53-4.5-10.02-10-10.02zm2.5 10.7c.46-.31 1.47-.92 1.5-1.27.04-.39-.67-.72-1.23-.23-.98.86-1.78.28-1.78.28s.7-.7 1.24-1.43c.55-.73 1.36-1.93 1.21-3.07-.16-1.11-1.73-1.91-1.91-1.22-.18.69.93 1.17.76 1.97-.24 1.17-3.77 4.27-3.77 4.27s-.18-1.83-.75-3.11c-.57-1.28-1.58-2.62-1.58-2.62s-.54.41-.15.95c.39.54 1.25 1.92 1.4 2.34s.33 1.08.23 1.71c-.11.62-.18.74-.18.74s-1.33.03-2.46-.4c-1.14-.42-2.35-1.35-2.4-.92-.05.43.64.87 1.21 1.21.58.34 2.24 1.03 2.24 1.03s-.15.52-.4.98c-.24.45-.97 1.6-.54 1.92.44.31.88-.16 1.23-.52.36-.36.8-1.14.8-1.14s.51.26 1.09.41c.58.15 1.43.21 1.43.21s.15.82.15 1.32 0 1.08.39 1.08.69-.75.69-1.21.02-1.22.02-1.22 1.2.02 2.01-.21c.81-.23 1.25-.5 1.25-.9s-.96-.43-1.25-.43c-.28 0-1.34-.13-1.34-.13s.23-1.73.08-2.78"></path>
                    </svg>
                    Apple
                  </button>
                </div>
              </form>

              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <Link
                    to={
                      redirect ? `/register?redirect=${redirect}` : "/register"
                    }
                    className="font-semibold text-primary hover:text-primary/90 transition-colors duration-200"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
