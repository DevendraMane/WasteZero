import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState("");

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "password") {
      checkStrength(value);
    }
  };

  const checkStrength = (password) => {
    if (password.length < 6) {
      setStrength("Weak");
    } else if (
      password.match(/[A-Z]/) &&
      password.match(/[0-9]/) &&
      password.length >= 8
    ) {
      setStrength("Strong");
    } else {
      setStrength("Medium");
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      alert("All fields are required");
      return;
    }

    try {
      await loginUser(formData);
      navigate("/dashboard");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button className="flex-1 py-2 font-semibold border-b-2 border-green-600">
          Login
        </button>
        <button
          className="flex-1 py-2 text-gray-500"
          onClick={() => navigate("/register")}
        >
          Register
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-2">Login to your account</h2>
      <p className="text-gray-500 mb-6">
        Enter your credentials to access your account
      </p>

      <form onSubmit={handleLogin} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block mb-1 font-medium">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password */}
        <div>
          <label className="block mb-1 font-medium">Password</label>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Your password"
              value={formData.password}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
            />

            {/* Eye Toggle */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-500 hover:text-green-600"
            >
              {showPassword ? "🙈" : "👁"}
            </button>
          </div>

          {/* Password Strength */}
          {formData.password && (
            <p
              className={`text-sm mt-1 ${
                strength === "Weak"
                  ? "text-red-500"
                  : strength === "Medium"
                    ? "text-yellow-500"
                    : "text-green-600"
              }`}
            >
              Strength: {strength}
            </p>
          )}

          {/* Forgot Password */}
          <div className="text-right mt-2">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-green-600 hover:underline"
            >
              Forgot Password?
            </button>
          </div>
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition duration-300 disabled:opacity-60"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
};

export default Login;
