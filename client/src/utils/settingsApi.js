/**
 * Fetch platform settings from the API
 * Works without authentication (public endpoint)
 */
export const fetchSettings = async () => {
  try {
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    if (!backendUrl) {
      console.error("VITE_BACKEND_URL is not defined");
      return null;
    }
    const res = await fetch(`${backendUrl}/api/settings`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
};

/**
 * Fetch settings with authentication token
 */
export const fetchSettingsWithAuth = async (token, backendUrl) => {
  try {
    const API = import.meta.env.VITE_BACKEND_URL;
    if (!API) {
      console.error("VITE_BACKEND_URL is not defined");
      return null;
    }
    const res = await fetch(`${API}/api/settings`, {
      headers: { Authorization: token },
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch settings:", error);
    return null;
  }
};
