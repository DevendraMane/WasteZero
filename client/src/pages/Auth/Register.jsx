import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { showError, showSuccess } from "../../utils/alert";
import loader from "../../assets/loader.png";
import googleIcon from "../../assets/google.svg";

const Register = () => {
  const navigate = useNavigate();
  const { registerUser, isLoading } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "volunteer",
    adminCode: "", // NEW: for admin registration
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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

  const passwordsMatch =
    formData.confirmPassword && formData.password === formData.confirmPassword;

  const handleRegister = async (e) => {
    e.preventDefault();

    // Frontend validation
    if (!formData.name.trim()) {
      showError("Please enter your full name");
      return;
    }

    if (!formData.email.trim()) {
      showError("Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      showError("Please enter a valid email address");
      return;
    }

    if (formData.password.length < 6) {
      showError("Password must be at least 6 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return;
    }

    // NEW: Validate admin code if role is admin
    if (formData.role === "admin" && !formData.adminCode.trim()) {
      showError("Please enter the admin secret code");
      return;
    }

    try {
      await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        adminCode: formData.adminCode, // NEW: send admin code if provided
      });

      showSuccess(
        `Registration successful! Verification email sent to ${formData.email}. Please check your inbox (or spam folder) and click the verification link.`,
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        role: "volunteer",
        adminCode: "",
      });

      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);

      // Provide specific error messages
      let errorTitle = "Registration Failed";
      let errorText = error.message || "An error occurred during registration";

      // Check for specific error scenarios
      if (errorText.includes("already registered")) {
        errorTitle = "Email Already Exists";
        errorText =
          "This email is already registered. Please login or use a different email.";
      } else if (errorText.includes("disabled")) {
        errorTitle = "Registrations Disabled";
        errorText =
          "New registrations are currently disabled. Please contact the administrator.";
      }

      showError(`${errorTitle}: ${errorText}`);
    }
  };

  const handleGoogleRegister = () => {
    window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/auth/google`;
  };

  return (
    <div>
      {/* Tabs */}
      <div className="flex mb-6 border-b">
        <button
          className="flex-1 py-2 text-gray-500"
          onClick={() => navigate("/login")}
        >
          Login
        </button>
        <button className="flex-1 py-2 font-semibold border-b-2 border-green-600">
          Register
        </button>
      </div>

      <h2 className="text-2xl font-bold mb-1">Create a new account</h2>
      <p className="text-gray-500 mb-4 text-sm">
        Fill in your details to join WasteZero
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block mb-1 font-medium text-sm">Full Name</label>
          <input
            type="text"
            name="name"
            placeholder="Your full name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block mb-1 font-medium text-sm">Email</label>
          <input
            type="email"
            name="email"
            placeholder="Your email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Password + Confirm */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Password */}
          <div>
            <label className="block mb-1 font-medium text-sm">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.password && (
              <p
                className={`text-xs mt-1 ${
                  strength === "Weak"
                    ? "text-red-500"
                    : strength === "Medium"
                      ? "text-yellow-500"
                      : "text-green-600"
                }`}
              >
                {strength}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block mb-1 font-medium text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm password"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 pr-12 focus:outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-gray-500"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {formData.confirmPassword && (
              <p
                className={`text-xs mt-1 ${
                  passwordsMatch ? "text-green-600" : "text-red-500"
                }`}
              >
                {passwordsMatch ? "Passwords match" : "Passwords do not match"}
              </p>
            )}
          </div>
        </div>

        {/* Role */}
        <div className="md:w-1/2">
          <label className="block mb-1 font-medium text-sm">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="volunteer">Volunteer</option>
            <option value="ngo">NGO</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {/* Admin Code (only show if role is admin) */}
        {formData.role === "admin" && (
          <div className="md:w-1/2">
            <label className="block mb-1 font-medium text-sm text-red-600">
              Admin Secret Code *
            </label>
            <input
              type="password"
              name="adminCode"
              placeholder="Enter admin code"
              value={formData.adminCode}
              onChange={handleChange}
              className="w-full border border-red-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Required to create admin account
            </p>
          </div>
        )}

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-semibold transition duration-300 flex items-center justify-center"
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <img
                src={loader}
                alt="loading"
                className="w-4 h-4 animate-spin"
              />
              Creating account...
            </div>
          ) : (
            "Create Account"
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="flex items-center my-4">
        <div className="flex-1 h-px bg-gray-300" />
        <span className="px-3 text-sm text-gray-500">or</span>
        <div className="flex-1 h-px bg-gray-300" />
      </div>

      {/* Google Register */}
      <button
        type="button"
        onClick={handleGoogleRegister}
        className="w-full flex items-center justify-center gap-3 bg-white border border-gray-300 py-3 rounded-lg hover:bg-gray-50 transition font-medium shadow-sm hover:shadow-md"
      >
        <img src={googleIcon} alt="Google" className="w-5 h-5" />
        Sign Up with Google
      </button>

      {/* ⭐ Small UI Tip */}
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?
        <span
          onClick={() => navigate("/login")}
          className="text-green-600 cursor-pointer ml-1 font-medium hover:underline"
        >
          Login
        </span>
      </p>
    </div>
  );
};

export default Register;
