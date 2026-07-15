import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";

import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard/Dashboard";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },

  {
  element: (
    <ProtectedRoute>
      <DashboardLayout />
    </ProtectedRoute>
  ),
  children: [
    {
      path: "/dashboard",
      element: (
        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
          <Dashboard />
        </ProtectedRoute>
      ),
    },

    {
      path: "/organizations",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <span>Organization</span>
        </ProtectedRoute>
      ),
    },

    {
      path: "/users",
      element: (
        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
          <span>Users</span>
        </ProtectedRoute>
      ),
    },

    {
      path: "/rewards",
      element: (
        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
          <span>Rewards</span>
        </ProtectedRoute>
      ),
    },

    {
      path: "/challenges",
      element: (
        <ProtectedRoute allowedRoles={["admin", "sub-admin"]}>
          <span>Challenges</span>
        </ProtectedRoute>
      ),
    },

    {
      path: "/redemptions",
      element: (
        <ProtectedRoute
          allowedRoles={["admin", "sub-admin", "staff"]}
        >
          <span>Redemptions</span>
        </ProtectedRoute>
      ),
    },
  ],
}
]);

export default function App() {
  return <RouterProvider router={router} />;
}