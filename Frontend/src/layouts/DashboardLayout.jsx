import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import Navbar from "../components/Navbar.jsx";
import Sidebar from "../components/Sidebar.jsx";
import { Toaster } from "react-hot-toast";

/**
 * Responsive dashboard shell.
 *
 * Navigation content is not owned by this component — pass whatever
 * sidebar markup fits the current role (e.g. built from
 * NAV_ITEMS_BY_ROLE[user.role]) via the `sidebar` prop. This component
 * only handles layout: desktop column, mobile drawer, top navbar, and
 * the routed content area.
 *
 * @param {string} [title] - Page title forwarded to the top navbar
 * @param {object} [navbarProps] - Any additional props forwarded to Navbar (user, onLogout, onThemeChange, ...)
 */
export default function DashboardLayout() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const location = useLocation();
  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock body scroll while the mobile drawer is open.
  useEffect(() => {
    document.body.style.overflow = isDrawerOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isDrawerOpen]);

  // Close on Escape.
  useEffect(() => {
    if (!isDrawerOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setIsDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Toaster
        position="bottom-left" // Position layout options: top-left, top-center, top-right, bottom-left, bottom-center, bottom-right
        reverseOrder={false}
        toastOptions={{
          // Match your design token classes cleanly!
          className: "bg-card border border-border text-foreground text-sm rounded-lg shadow-md",
          duration: 4000, // Auto-close timing footprint: 4000ms (4 seconds)
          success: {
            iconTheme: {
              primary: "#22c55e", // Tailwind green-500 matching token
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#ef4444", // Tailwind red-500 matching token
              secondary: "#ffffff",
            },
          },
        }}
      />
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:border-r lg:border-border lg:bg-card">
        <Sidebar/>
      </aside>

      {/* Mobile drawer + backdrop */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          isDrawerOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isDrawerOpen}
      >
        <div
          onClick={() => setIsDrawerOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
            isDrawerOpen ? "opacity-100" : "opacity-0"
          }`}
        />
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Navigation"
          className={`absolute left-0 top-0 flex h-full w-64 flex-col border-r border-border bg-card transition-transform duration-300 ${
            isDrawerOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex items-center justify-end p-2">
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close menu"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
            >
              <X size={18} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <Sidebar/>
          </div>
        </div>
      </div>

      {/* Right column: navbar + routed content */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-center bg-card">
          <button
            type="button"
            onClick={() => setIsDrawerOpen(true)}
            aria-label="Open menu"
            className="px-4 py-4 text-foreground/70 hover:text-foreground transition-colors lg:hidden"
          >
            <Menu size={20} />
          </button>
          <div className="min-w-0 flex-1">
            <Navbar/>
          </div>
        </div>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}