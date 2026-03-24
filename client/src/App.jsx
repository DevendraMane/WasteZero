import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";
import { lazy, Suspense } from "react";
import Loader from "./components/Loader";
import { useAuth } from "./store/AuthContext";
const Auth = lazy(() => import("./pages/Auth/Auth"));
const Login = lazy(() => import("./pages/Auth/Login"));
const Register = lazy(() => import("./pages/Auth/Register"));
const ForgotPassword = lazy(() => import("./pages/Auth/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/Auth/ResetPassword"));

const NGOPickupManagement = lazy(() => import("./pages/NGO/PickupManagement"));
const Dashboard = lazy(() => import("./pages/Dashboard/Dashboard"));
const Messages = lazy(() => import("./pages/Messages/Messages"));
const Impact = lazy(() => import("./pages/Impact/Impact"));
const Settings = lazy(() => import("./pages/Settings/Settings"));
const Opportunities = lazy(() => import("./pages/Opportunities/Opportunities"));
const OpportunitiesDetail = lazy(
  () => import("./pages/Opportunities/OpportunitiesDetail"),
);
const EditOpportunity = lazy(
  () => import("./pages/Opportunities/EditOpportunity"),
);

const DashboardLayout = lazy(() => import("./layouts/DashboardLayout"));
const Profile = lazy(() => import("./pages/Profile/Profile"));
const ChangePassword = lazy(() => import("./pages/Profile/ChangePassword"));
const HelpRouter = lazy(() => import("./pages/Help/HelpRouter"));

import PublicRoute from "./components/PublicRoute";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";

const UserManagement = lazy(() => import("./pages/Admin/UserManagement"));
const Analytics = lazy(() => import("./pages/Admin/Analytics"));
const PlatformSettings = lazy(() => import("./pages/Admin/PlatformSettings"));
const PickupManagement = lazy(() => import("./pages/Admin/PickupManagement"));
const OpportunityManagement = lazy(
  () => import("./pages/Admin/OpportunityManagement"),
);
const ReportedOpportunitiesManagement = lazy(
  () => import("./pages/Admin/ReportedOpportunitiesManagement"),
);
const AdminActivityLogs = lazy(() => import("./pages/Admin/AdminActivityLogs"));
const Applications = lazy(() => import("./pages/NGO/Applications"));
const TestLoader = lazy(() => import("./pages/TestLoader"));
const OAuthSuccess = lazy(() => import("./pages/Auth/OAuthSuccess"));
const OAuthFailed = lazy(() => import("./pages/Auth/OAuthFailed"));
const SchedulePickups = lazy(() => import("./pages/Schedule/SchedulePickups"));
const Notifications = lazy(() => import("./pages/Notification/Notifications"));

export const App = () => {
  const { isLoading, authReady } = useAuth();
  if (!authReady) {
    return <Loader fullScreen />;
  }
  const router = createBrowserRouter([
    {
      path: "/test-loader",
      element: <TestLoader />,
    },
    {
      path: "/index.html",
      element: <OAuthSuccess />,
    },
    {
      path: "/oauth-success",
      element: <OAuthSuccess />,
    },
    {
      path: "/oauth-failed",
      element: <OAuthFailed />,
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
        {
          path: "ngo-pickups",
          element: (
            <RoleProtectedRoute allowedRoles={["ngo"]}>
              <NGOPickupManagement />
            </RoleProtectedRoute>
          ),
        },
        { path: "schedule", element: <SchedulePickups /> },
        { path: "messages", element: <Messages /> },
        { path: "notifications", element: <Notifications /> },
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
        {
          path: "reported-opportunities",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <ReportedOpportunitiesManagement />
            </RoleProtectedRoute>
          ),
        },
        {
          path: "admin-logs",
          element: (
            <RoleProtectedRoute allowedRoles={["admin"]}>
              <AdminActivityLogs />
            </RoleProtectedRoute>
          ),
        },
      ],
    },
  ]);

  return (
    <Suspense fallback={<Loader fullScreen />}>
      {isLoading && <Loader fullScreen />}
      <RouterProvider router={router} />
    </Suspense>
  );
};

export default App;
