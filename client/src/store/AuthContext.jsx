import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { socket } from "../utils/socket";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(localStorage.getItem("waste_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("waste_user")),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false); // ⭐ new

  const isLoggedIn = !!token;

  const authorizationToken = token ? `Bearer ${token}` : "";

  const storeToken = (newToken, userData) => {
    localStorage.setItem("waste_token", newToken);
    localStorage.setItem("waste_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  const logoutUser = () => {
    localStorage.removeItem("waste_token");
    localStorage.removeItem("waste_user");

    setToken(null);
    setUser(null);
  };

  const registerUser = async (formData) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const loginUser = async (formData) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      storeToken(data.token, data.user);
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const changePassword = async (formData) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: authorizationToken,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Password change failed");
      }

      return data;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    if (!token) return;

    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/profile`, {
        headers: { Authorization: authorizationToken },
      });

      if (res.ok) {
        const data = await res.json();

        setUser((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(data)) {
            localStorage.setItem("waste_user", JSON.stringify(data));
            return data;
          }
          return prev;
        });
      }
    } catch {
      logoutUser();
    } finally {
      setIsLoading(false);
    }
  };

  // ⭐ Initialize auth when app loads
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        await fetchProfile();
      }
      setAuthReady(true);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (user?._id && !socket.connected) {
      socket.connect();
      socket.emit("join", user._id);
    }
  }, [user]);

  const contextValue = useMemo(
    () => ({
      API,
      token,
      user,
      isLoggedIn,
      isLoading,
      authReady, // ⭐ added
      loginUser,
      registerUser,
      logoutUser,
      authorizationToken,
      changePassword,
      storeToken,
      fetchProfile,
    }),
    [API, token, user, isLoading, authReady],
  );

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
