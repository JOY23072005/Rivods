import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { login } from "../api/auth";
import { useAuth } from "../context/AuthContext";

// Where each role lands after login.
const ROLE_REDIRECTS = {
  admin: "/dashboard",
  "sub-admin": "/dashboard",
  staff: "/redemptions",
};

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { email: "", password: "", orgid: "" },
  });

  const [toast, setToast] = useState(null); // { message: string }
  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  const showErrorToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 4000);
  };

  const onSubmit = async (values) => {
    try {
      const response = await login(values);
      // Adjust this destructuring if the backend wraps the payload
      // differently (e.g. response.data.data).
      const { user, token } = response.data;

      setAuth(user, token);

      const destination = ROLE_REDIRECTS[user?.role] || "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid credentials. Try again.";
      showErrorToast(message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* Error toast */}
      {toast && (
        <div
          role="alert"
          className="fixed top-4 right-4 z-50 max-w-sm rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 shadow-lg"
        >
          {toast.message}
        </div>
      )}

      <div className="w-full max-w-sm rounded-lg border border-border bg-card p-8">
        <div className="mb-6 text-center">
          <h1 className="text-xl font-semibold text-foreground">Log in</h1>
          <p className="mt-1 text-sm text-foreground/60">
            Enter your details to access your account.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="name@company.com"
              disabled={isSubmitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              {...register("email", {
                required: "Email is required.",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address.",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              {...register("password", {
                required: "Password is required.",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters.",
                },
              })}
            />
            {errors.password && (
              <p className="mt-1 text-xs text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="orgid"
              className="mb-1 block text-sm font-medium text-foreground"
            >
              Organization ID
            </label>
            <input
              id="orgid"
              type="text"
              placeholder="Organization ID"
              disabled={isSubmitting}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
              {...register("orgid", {
                required: "Organization ID is required.",
              })}
            />
            {errors.orgid && (
              <p className="mt-1 text-xs text-red-600">
                {errors.orgid.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 size={16} className="animate-spin" />}
            {isSubmitting ? "Logging in..." : "Log in"}
          </button>
        </form>
      </div>
    </div>
  );
}