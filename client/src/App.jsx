import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";
import Dashboard from "./pages/Dashboard/Dashboard";

import ProtectedRoute from "./components/ProtectedRoute.jsx";
import Opportunities from "./pages/Opportunities/Opportunities.jsx";
import DashboardLayout from "./layouts/DashboardLayout.jsx";
import Profile from "./pages/Profile/Profile.jsx";

export const App = () => {
  const token = localStorage.getItem("token");

  const router = createBrowserRouter([
    {
      path: "/",
      element: token ? <Navigate to="/dashboard" /> : <Navigate to="/login" />,
    },

    {
      path: "/login",
      element: token ? <Navigate to="/dashboard" /> : <Auth />,
      children: [{ path: "", element: <Login /> }],
    },

    {
      path: "/register",
      element: token ? <Navigate to="/dashboard" /> : <Auth />,
      children: [{ path: "", element: <Register /> }],
    },

    // ✅ DASHBOARD LAYOUT ROUTE
    {
      path: "/",
      element: (
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        {
          path: "dashboard",
          element: <Dashboard />,
        },
        {
          path: "opportunities",
          element: <Opportunities />,
        },
        {
          path: "profile",
          element: <Profile />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
