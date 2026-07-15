import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { ChevronDown, Loader2 } from "lucide-react";
import { login, requestOtp, verifyOtp } from "../api/auth.js";
import { useAuth } from "../context/AuthContext.jsx";
import axiosInstance from "../api/axios.js";

// Where each role lands after login.
const ROLE_REDIRECTS = {
  admin: "/dashboard",
  "sub-admin": "/dashboard",
  staff: "/redemptions",
};

const OTP_PURPOSE = "LOGIN";

/**
 * Searchable organization combobox.
 * Displays organization names, but reports the underlying org id
 * (the `orgid` field returned by GET /org) to the caller via onChange.
 */
function OrganizationCombobox({
  id,
  organizations,
  isLoading,
  value,
  onChange,
  onBlur,
  error,
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOrg = organizations.find((org) => org.orgid === value);

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        onBlur?.();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onBlur]);

  const filteredOrgs = organizations.filter((org) =>
    org.name.toLowerCase().includes(query.toLowerCase())
  );

  const displayValue = isOpen ? query : selectedOrg?.name || "";

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <input
          id={id}
          type="text"
          autoComplete="off"
          placeholder={isLoading ? "Loading organizations..." : "Search organization..."}
          disabled={isLoading}
          value={displayValue}
          onFocus={() => {
            setIsOpen(true);
            setQuery("");
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            if (value) onChange("");
          }}
          className="w-full rounded-md border border-border bg-background px-3 py-2 pr-9 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-foreground/40">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <ChevronDown size={16} />
          )}
        </span>
      </div>

      {isOpen && !isLoading && (
        <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-border bg-card shadow-lg">
          {filteredOrgs.length === 0 ? (
            <p className="px-3 py-2 text-sm text-foreground/50">
              No organizations found
            </p>
          ) : (
            filteredOrgs.map((org) => (
              <button
                type="button"
                key={org.orgid}
                onClick={() => {
                  onChange(org.orgid);
                  setQuery(org.name);
                  setIsOpen(false);
                }}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-primary/10 ${
                  org.orgid === value
                    ? "bg-primary/10 text-primary"
                    : "text-foreground"
                }`}
              >
                {org.name}
              </button>
            ))
          )}
        </div>
      )}

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export default function Login() {
  const [activeTab, setActiveTab] = useState("password"); // "password" | "otp"
  const [toast, setToast] = useState(null); // { message: string }
  const [organizations, setOrganizations] = useState([]);
  const [isLoadingOrgs, setIsLoadingOrgs] = useState(true);
  const [otpRequested, setOtpRequested] = useState(false);
  const [isRequestingOtp, setIsRequestingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);

  const { login: setAuth } = useAuth();
  const navigate = useNavigate();

  // Password login form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    control: controlPassword,
    formState: { errors: passwordErrors, isSubmitting: isLoggingIn },
  } = useForm({
    defaultValues: { orgid: "", email: "", password: "" },
  });

  // OTP login form
  const {
    register: registerOtp,
    handleSubmit: handleSubmitOtp,
    control: controlOtp,
    getValues: getOtpValues,
    formState: { errors: otpErrors },
  } = useForm({
    defaultValues: { orgid: "", email: "", otp: "" },
  });

  const showErrorToast = (message) => {
    setToast({ message });
    setTimeout(() => setToast(null), 4000);
  };

  // Fetch organizations on mount.
  useEffect(() => {
    let isMounted = true;

    const fetchOrganizations = async () => {
      setIsLoadingOrgs(true);
      try {
        const response = await axiosInstance.get("/org");
        if (isMounted) {
          setOrganizations(response.data?.organizations || []);
        }
      } catch (err) {
        if (isMounted) {
          showErrorToast("Failed to load organizations.");
        }
      } finally {
        if (isMounted) setIsLoadingOrgs(false);
      }
    };

    fetchOrganizations();
    return () => {
      isMounted = false;
    };
  }, []);

  const redirectAfterAuth = (user) => {
    const destination = ROLE_REDIRECTS[user?.role] || "/dashboard";
    navigate(destination, { replace: true });
  };

  const onPasswordSubmit = async (values) => {
    try {
      const response = await login(values);
      // Adjust this destructuring if the backend wraps the payload
      // differently (e.g. response.data.data).
      const { user, token } = response.data;
      setAuth(user, token);
      redirectAfterAuth(user);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid credentials. Try again.";
      showErrorToast(message);
    }
  };

  const onRequestOtp = async (values) => {
    setIsRequestingOtp(true);
    try {
      await requestOtp({
        email: values.email,
        orgid: values.orgid,
        purpose: OTP_PURPOSE,
      });
      setOtpRequested(true);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Failed to send OTP. Try again.";
      showErrorToast(message);
    } finally {
      setIsRequestingOtp(false);
    }
  };

  const onVerifyOtp = async (values) => {
    setIsVerifyingOtp(true);
    try {
      const response = await verifyOtp({
        email: values.email,
        orgid: values.orgid,
        otp: values.otp,
        purpose: OTP_PURPOSE,
      });
      const { user, token } = response.data;
      setAuth(user, token);
      redirectAfterAuth(user);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Invalid or expired OTP. Try again.";
      showErrorToast(message);
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setOtpRequested(false);
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

        {/* Tabs */}
        <div className="mb-6 grid grid-cols-2 rounded-md border border-border p-1">
          <button
            type="button"
            onClick={() => switchTab("password")}
            className={`rounded-sm py-1.5 text-sm font-medium transition-colors ${
              activeTab === "password"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            Password Login
          </button>
          <button
            type="button"
            onClick={() => switchTab("otp")}
            className={`rounded-sm py-1.5 text-sm font-medium transition-colors ${
              activeTab === "otp"
                ? "bg-primary text-primary-foreground"
                : "text-foreground/60 hover:text-foreground"
            }`}
          >
            OTP Login
          </button>
        </div>

        {/* Password Login */}
        {activeTab === "password" && (
          <form
            onSubmit={handleSubmitPassword(onPasswordSubmit)}
            noValidate
            className="space-y-4"
          >
            <div>
              <label
                htmlFor="orgid-password"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Organization
              </label>
              <Controller
                name="orgid"
                control={controlPassword}
                rules={{ required: "Please select an organization." }}
                render={({ field }) => (
                  <OrganizationCombobox
                    id="orgid-password"
                    organizations={organizations}
                    isLoading={isLoadingOrgs}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={passwordErrors.orgid?.message}
                  />
                )}
              />
            </div>

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
                disabled={isLoggingIn}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                {...registerPassword("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
              />
              {passwordErrors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordErrors.email.message}
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
                disabled={isLoggingIn}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                {...registerPassword("password", {
                  required: "Password is required.",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters.",
                  },
                })}
              />
              {passwordErrors.password && (
                <p className="mt-1 text-xs text-red-600">
                  {passwordErrors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {isLoggingIn && <Loader2 size={16} className="animate-spin" />}
              {isLoggingIn ? "Logging in..." : "Log in"}
            </button>
          </form>
        )}

        {/* OTP Login */}
        {activeTab === "otp" && (
          <form onSubmit={(e) => e.preventDefault()} noValidate className="space-y-4">
            <div>
              <label
                htmlFor="orgid-otp"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Organization
              </label>
              <Controller
                name="orgid"
                control={controlOtp}
                rules={{ required: "Please select an organization." }}
                render={({ field }) => (
                  <OrganizationCombobox
                    id="orgid-otp"
                    organizations={organizations}
                    isLoading={isLoadingOrgs}
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={otpErrors.orgid?.message}
                  />
                )}
              />
            </div>

            <div>
              <label
                htmlFor="otp-email"
                className="mb-1 block text-sm font-medium text-foreground"
              >
                Email
              </label>
              <input
                id="otp-email"
                type="email"
                autoComplete="email"
                placeholder="name@company.com"
                disabled={otpRequested || isRequestingOtp}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                {...registerOtp("email", {
                  required: "Email is required.",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "Enter a valid email address.",
                  },
                })}
              />
              {otpErrors.email && (
                <p className="mt-1 text-xs text-red-600">
                  {otpErrors.email.message}
                </p>
              )}
            </div>

            {!otpRequested ? (
              <button
                type="button"
                onClick={handleSubmitOtp(onRequestOtp)}
                disabled={isRequestingOtp}
                className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
              >
                {isRequestingOtp && <Loader2 size={16} className="animate-spin" />}
                {isRequestingOtp ? "Sending OTP..." : "Request OTP"}
              </button>
            ) : (
              <>
                <div>
                  <label
                    htmlFor="otp"
                    className="mb-1 block text-sm font-medium text-foreground"
                  >
                    OTP
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="Enter the 6-digit code"
                    disabled={isVerifyingOtp}
                    className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary disabled:opacity-60"
                    {...registerOtp("otp", {
                      required: "OTP is required.",
                    })}
                  />
                  {otpErrors.otp && (
                    <p className="mt-1 text-xs text-red-600">
                      {otpErrors.otp.message}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleSubmitOtp(onVerifyOtp)}
                  disabled={isVerifyingOtp}
                  className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {isVerifyingOtp && <Loader2 size={16} className="animate-spin" />}
                  {isVerifyingOtp ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  type="button"
                  onClick={handleSubmitOtp(onRequestOtp)}
                  disabled={isRequestingOtp}
                  className="w-full text-center text-xs text-foreground/60 hover:text-foreground transition-colors disabled:opacity-60"
                >
                  {isRequestingOtp ? "Resending..." : "Resend OTP"}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </div>
  );
}