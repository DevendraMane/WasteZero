import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import Loader from "./components/Loader";
import { useAuth } from "./store/AuthContext";

import Dashboard from "./pages/Dashboard/Dashboard";
import Messages from "./pages/Messages/Messages";
import Impact from "./pages/Impact/Impact";
import Settings from "./pages/Settings/Settings";
import Opportunities from "./pages/Opportunities/Opportunities";
import OpportunitiesDetail from "./pages/Opportunities/OpportunitiesDetail";
import EditOpportunity from "./pages/Opportunities/EditOpportunity";

import DashboardLayout from "./layouts/DashboardLayout";
import Profile from "./pages/Profile/Profile";
import ChangePassword from "./pages/Profile/ChangePassword";
import HelpRouter from "./pages/Help/HelpRouter";

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

import UserManagement from "./pages/Admin/UserManagement";
import Analytics from "./pages/Admin/Analytics";
import PlatformSettings from "./pages/Admin/PlatformSettings";
import PickupManagement from "./pages/Admin/PickupManagement";
import OpportunityManagement from "./pages/Admin/OpportunityManagement";
import Applications from "./pages/NGO/Applications";
import TestLoader from "./pages/TestLoader";
import OAuthSuccess from "./pages/Auth/OAuthSuccess";
import SchedulePickups from "./pages/Schedule/SchedulePickups";

export const App = () => {
  const { isLoading } = useAuth();

  const router = createBrowserRouter([
    {
      path: "/test-loader",
      element: <TestLoader />,
    },
    {
      path: "/oauth-success",
      element: <OAuthSuccess />,
    },
    {
      path: "/",
      element: <Navigate to="/login" replace />,
    },

    // AUTH ROUTES
    {
      path: "/",
      element: (
        <PublicRoute>
          <Auth />
        </PublicRoute>
      ),
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "forgot-password", element: <ForgotPassword /> },
        { path: "reset-password/:token", element: <ResetPassword /> },
      ],
    },

    // PROTECTED ROUTES
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
        { path: "opportunities/:id", element: <OpportunitiesDetail /> },
        {
          path: "opportunities/edit/:id",
          element: (
            <RoleProtectedRoute allowedRoles={["ngo"]}>
              <EditOpportunity />
            </RoleProtectedRoute>
          ),
        },
        { path: "schedule", element: <SchedulePickups /> },
        { path: "messages", element: <Messages /> },
        { path: "settings", element: <Settings /> },
        { path: "profile", element: <Profile /> },
        { path: "change-password", element: <ChangePassword /> },
        { path: "help", element: <HelpRouter /> },

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
        {
          path: "applications",
          element: (
            <RoleProtectedRoute allowedRoles={["ngo"]}>
              <Applications />
            </RoleProtectedRoute>
          ),
        },
        {
          path: "impact",
          element: (
            <RoleProtectedRoute allowedRoles={["volunteer"]}>
              <Impact />
            </RoleProtectedRoute>
          ),
        },
        {
          path: "platform-settings",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <PlatformSettings />
            </RoleProtectedRoute>
          ),
        },
        {
          path: "pickups",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <PickupManagement />
            </RoleProtectedRoute>
          ),
        },
        {
          path: "admin-opportunities",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <OpportunityManagement />
            </RoleProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return (
    <>
      {isLoading && <Loader fullScreen />}
      <RouterProvider router={router} />
    </>
  );
};

export default App;
