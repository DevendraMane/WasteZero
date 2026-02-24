import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard/Dashboard";
import Schedule from "./pages/Schedule/Schedule";
import Messages from "./pages/Messages/Messages";
import Impact from "./pages/Impact/Impact";
import Settings from "./pages/Settings/Settings";
import Opportunities from "./pages/Opportunities/Opportunities.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Profile from "./pages/Profile/Profile.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import UserManagement from "./pages/Admin/UserManagement";

// 🔥 IMPORTANT: Import these
import Analytics from "./pages/Admin/Analytics";
import Applications from "./pages/NGO/Applications";

export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },

    {
      path: "/login",
      element: <Auth />,
      children: [{ index: true, element: <Login /> }],
    },

    {
      path: "/register",
      element: <Auth />,
      children: [{ index: true, element: <Register /> }],
    },

    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "dashboard", element: <Dashboard /> },
        { path: "opportunities", element: <Opportunities /> },
        { path: "schedule", element: <Schedule /> },
        { path: "messages", element: <Messages /> },
        { path: "settings", element: <Settings /> },
        { path: "profile", element: <Profile /> },

        // 👑 Admin Only
        {
          path: "analytics",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <Analytics />
            </RoleProtectedRoute>
          ),
        },

        {
          path: "users",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <UserManagement />
            </RoleProtectedRoute>
          ),
        },

        // 🏢 NGO Only
        {
          path: "applications",
          element: (
            <RoleProtectedRoute allowedRoles={["ngo"]}>
              <Applications />
            </RoleProtectedRoute>
          ),
        },

        // 👤 Volunteer Only
        {
          path: "impact",
          element: (
            <RoleProtectedRoute allowedRoles={["volunteer"]}>
              <Impact />
            </RoleProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
