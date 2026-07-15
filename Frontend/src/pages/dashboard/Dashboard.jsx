import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

import AdminDashboard from "./AdminDashboard.jsx";
import OrganizationDashboard from "./OrganizationDashboard.jsx";
// import OrganizationDashboard from "./OrganizationDashboard";

export default function Dashboard() {
  const { user } = useAuth();

  switch (user?.role) {
    case "admin":
      return <AdminDashboard />;

    case "sub-admin":
      return <OrganizationDashboard />;

    case "staff":
      return <Navigate to="/staff/redemptions" replace />;

    default:
      return <Navigate to="/login" replace />;
  }
}