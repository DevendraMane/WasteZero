import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { socket } from "../utils/socket";

export const AuthContext = createContext();

// Generate or retrieve unique tab ID
const getTabId = () => {
  let tabId = sessionStorage.getItem("waste_tabId");
  if (!tabId) {
    tabId = `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem("waste_tabId", tabId);
  }
  return tabId;
};

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_BACKEND_URL;
  const tabId = getTabId();

  // Use localStorage with tab-specific keys for persistence + multi-tab support
  // Each tab has its own storage: waste_token_{tabId}, waste_user_{tabId}
  const tokenKey = `waste_token_${tabId}`;
  const userKey = `waste_user_${tabId}`;

  const [token, setToken] = useState(localStorage.getItem(tokenKey));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem(userKey) || "null"),
  );
  const [isLoading, setIsLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const isLoggedIn = !!token;

  const authorizationToken = token ? `Bearer ${token}` : "";

  const storeToken = (newToken, userData) => {
    // Store with tab-specific keys in localStorage
    // This persists across page reloads but is unique per tab
    localStorage.setItem(tokenKey, newToken);
    localStorage.setItem(userKey, JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
  };

  const logoutUser = () => {
    // Clear only this tab's data
    localStorage.removeItem(tokenKey);
    localStorage.removeItem(userKey);

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
            // Store in tab-specific localStorage key
            localStorage.setItem(userKey, JSON.stringify(data));
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
    if (user?._id) {
      socket.connect();
      socket.emit("join", user._id);
    }

    return () => {
      socket.off("new_notification");
    };
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
