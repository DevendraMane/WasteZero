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
      children: [
        {
          path: "",
          element: <Login />,
        },
      ],
    },

    {
      path: "/register",
      element: token ? <Navigate to="/dashboard" /> : <Auth />,
      children: [
        {
          path: "",
          element: <Register />,
        },
      ],
    },

    {
      path: "/dashboard",
      element: (
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      ),
    },
    {
      path: "/opportunities",
      element: (
        <ProtectedRoute>
          <Opportunities />
        </ProtectedRoute>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
