import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ClipboardList,
  Settings,
  Globe,
  Coins,
  TicketCheck,
  UserCog,
} from "lucide-react";

const NAV_ITEMS_BY_ROLE = {
  admin: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Organizations", path: "/organizations", icon: Globe },
    { label: "Users", path: "/users", icon: Users },
    { label: "Rewards", path: "/rewards", icon: Coins },
    { label: "Challenges", path: "/challenges", icon: ClipboardList },
    { label: "Redemptions", path: "/redemptions", icon: TicketCheck },
    { label: "Settings", path: "/settings", icon: Settings },
  ],
  "sub-admin": [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Users", path: "/users", icon: Users },
    { label: "Rewards", path: "/rewards", icon: Coins },
    { label: "Challenges", path: "/challenges", icon: ClipboardList },
    { label: "Redemptions", path: "/redemptions", icon: TicketCheck },
    { label: "Profile", path: "/profile", icon: UserCog },
  ],
  staff: [
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Redemptions", path: "/redemptions", icon: TicketCheck },
  ],
};

/**
 * Sidebar content only — no drawer, overlay, or open/close state.
 * DashboardLayout owns the responsive shell (desktop column vs.
 * mobile drawer) and renders this as its `sidebar` prop.
 */
const Sidebar = ({ role }) => {
  const navItems = NAV_ITEMS_BY_ROLE[role] ?? [];

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-4">
        <span className="text-lg font-bold text-primary">Rivods</span>
      </div>

      <p className="px-5 pb-2 text-xs font-medium uppercase tracking-wide text-foreground/50">
        {role} menu
      </p>

      <nav className="flex-1 space-y-1 px-3">
        {navItems.map(({ label, path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-foreground hover:bg-primary/10"
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;