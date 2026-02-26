import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const API = import.meta.env.VITE_BACKEND_URL;

  const [token, setToken] = useState(localStorage.getItem("waste_token"));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("waste_user")),
  );
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [isLoading, setIsLoading] = useState(false);

  const authorizationToken = `Bearer ${token}`;

  const storeToken = (newToken, userData) => {
    localStorage.setItem("waste_token", newToken);
    localStorage.setItem("waste_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  const logoutUser = () => {
    localStorage.removeItem("waste_token");
    localStorage.removeItem("waste_user");

    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
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
        setUser(data);
      }
    } catch {
      logoutUser();
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) fetchProfile();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        API,
        token,
        user,
        isLoggedIn,
        isLoading,
        loginUser,
        registerUser,
        logoutUser,
        authorizationToken,
        changePassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
