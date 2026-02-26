import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const OAuthSuccess = () => {
  const navigate = useNavigate();
  const { API, storeToken } = useAuth();

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get("token");

    if (!token) {
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`${API}/api/auth/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const userData = await res.json();

        if (!res.ok) {
          throw new Error("Failed to fetch user");
        }

        storeToken(token, userData);

        navigate("/dashboard");
      } catch (err) {
        navigate("/login");
      }
    };

    fetchUser();
  }, []);

  return <div className="text-center mt-20">Logging you in...</div>;
};

export default OAuthSuccess;
