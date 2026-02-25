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

  // ================= STORE TOKEN =================
  const storeToken = (newToken, userData) => {
    localStorage.setItem("waste_token", newToken);
    localStorage.setItem("waste_user", JSON.stringify(userData));

    setToken(newToken);
    setUser(userData);
    setIsLoggedIn(true);
  };

  // ================= LOGOUT =================
  const logoutUser = () => {
    localStorage.removeItem("waste_token");
    localStorage.removeItem("waste_user");

    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  };

  // ================= REGISTER =================
  const registerUser = async (formData) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ================= LOGIN =================
  const loginUser = async (formData) => {
    try {
      setIsLoading(true);

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      storeToken(data.token, data.user);
      return data;
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // ================= FETCH PROFILE (Optional) =================
  const fetchProfile = async () => {
    if (!token) return;

    try {
      const res = await fetch(`${API}/api/auth/profile`, {
        headers: {
          Authorization: authorizationToken,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data);
      }
    } catch (err) {
      logoutUser();
    }
  };

  useEffect(() => {
    if (token) {
      fetchProfile();
    }
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
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom Hook
export const useAuth = () => {
  return useContext(AuthContext);
};
