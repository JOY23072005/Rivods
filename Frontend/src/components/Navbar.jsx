import { useState, useRef, useEffect } from "react";
import { Sun, Moon, ChevronDown, LogOut, User, Settings } from "lucide-react";

export default function Navbar({
  user = { name: "Alex Rivera", email: "alex@example.com" },
  onLogout = () => {},
  onThemeChange = () => {},
}) {
  const [isDark, setIsDark] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    onThemeChange(next ? "dark" : "light");
  };

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="w-full border-b border-border bg-card">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Page title */}
        <h1 className="text-lg font-semibold text-foreground truncate">
          Admin Panel
        </h1>

        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-foreground/70 hover:bg-background hover:text-foreground transition-colors"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((v) => !v)}
              aria-expanded={isDropdownOpen}
              aria-haspopup="true"
              className="flex items-center gap-2 rounded-md border border-border px-2 py-1.5 hover:bg-background transition-colors"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-medium">
                {initials}
              </span>
              <span className="hidden sm:block text-sm text-foreground max-w-[120px] truncate">
                {user.name}
              </span>
              <ChevronDown
                size={16}
                className={`text-foreground/50 transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 rounded-md border border-border bg-card shadow-lg overflow-hidden z-50">
                <div className="px-3 py-3 border-b border-border">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user.name}
                  </p>
                  <p className="text-xs text-foreground/60 truncate">
                    {user.email}
                  </p>
                </div>

                <div className="py-1">
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background transition-colors"
                  >
                    <User size={16} className="text-foreground/60" />
                    Profile
                  </button>
                  <button
                    type="button"
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-background transition-colors"
                  >
                    <Settings size={16} className="text-foreground/60" />
                    Settings
                  </button>
                </div>

                <div className="py-1 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onLogout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-background transition-colors"
                  >
                    <LogOut size={16} />
                    Log out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}