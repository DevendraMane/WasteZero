import "./App.css";
import {
  createBrowserRouter,
  RouterProvider,
  Navigate,
} from "react-router-dom";

import Auth from "./pages/Auth/Auth";
import Login from "./pages/Auth/Login";
import Register from "./pages/Auth/Register";

export const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <Navigate to="/login" />,
    },

    {
      path: "/login",
      element: <Auth />,
      children: [
        {
          path: "",
          element: <Login />,
        },
      ],
    },

    {
      path: "/register",
      element: <Auth />,
      children: [
        {
          path: "",
          element: <Register />,
        },
      ],
    },
  ]);

  return <RouterProvider router={router} />;
};

export default App;
