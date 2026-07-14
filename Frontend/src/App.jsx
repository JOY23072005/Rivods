import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import Login from "./pages/Login";
import ProtectedRoute from "./routes/ProtectedRoute";

function DashboardHome() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      Dashboard Working 🚀
    </div>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/login" replace />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  // Super Admin + Sub Admin
  {
    element: (
      <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
        <DashboardLayout/>
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/dashboard",
        element: <DashboardHome />,
      },

      {
        path: "/organizations",
        element: <div>Organizations</div>,
      },

      {
        path: "/users",
        element: <div>Users</div>,
      },

      {
        path: "/rewards",
        element: <div>Rewards</div>,
      },

      {
        path: "/challenges",
        element: <div>Challenges</div>,
      },

      {
        path: "/redemptions",
        element: <div>Redemptions</div>,
      },
    ],
  },

  // Staff
  {
    element: (
      <ProtectedRoute allowedRoles={["staff"]}>
        <DashboardLayout title="Staff Panel" />
      </ProtectedRoute>
    ),
    children: [
      {
        path: "/staff/redemptions",
        element: <DashboardHome />,
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/login" replace />,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}