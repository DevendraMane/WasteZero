import React, { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import { Eye, EyeOff, Lock } from "lucide-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  const { changePassword, isLoading, user } = useAuth();
  const { isDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (form.newPassword !== form.confirmPassword) {
      return setMessage("New passwords do not match");
    }

    try {
      await changePassword({
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });

      setMessage("Password updated successfully");

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      setMessage(err.message);
    }
  };

  useEffect(() => {
    if (user?.googleId) {
      navigate("/profile");
    }
  }, []);

  return (
    <div className="flex justify-center mt-12">
      <div
        className={`w-full max-w-xl rounded-2xl shadow-lg p-8 border transition duration-300 ${
          isDarkMode
            ? "bg-gray-800 border-gray-700"
            : "bg-white border-gray-200"
        }`}
      >
        <h2
          className={`text-2xl font-semibold mb-2 ${isDarkMode ? "text-white" : "text-gray-800"}`}
        >
          Change Password
        </h2>
        <p
          className={`text-sm mb-6 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
        >
          Update your password to keep your account secure.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Current Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showCurrent ? "text" : "password"}
              name="currentPassword"
              value={form.currentPassword}
              onChange={handleChange}
              placeholder="Current Password"
              className={`w-full rounded-lg px-10 py-3 pr-12 outline-none border transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
              } focus:ring-2`}
              required
            />
            <button
              type="button"
              onClick={() => setShowCurrent(!showCurrent)}
              className={`absolute right-3 top-3 transition ${
                isDarkMode
                  ? "text-gray-400 hover:text-blue-400"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* New Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showNew ? "text" : "password"}
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="New Password"
              className={`w-full rounded-lg px-10 py-3 pr-12 outline-none border transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
              } focus:ring-2`}
              required
            />
            <button
              type="button"
              onClick={() => setShowNew(!showNew)}
              className={`absolute right-3 top-3 transition ${
                isDarkMode
                  ? "text-gray-400 hover:text-blue-400"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <Lock size={18} className="absolute left-3 top-3 text-gray-400" />
            <input
              type={showConfirm ? "text" : "password"}
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm Password"
              className={`w-full rounded-lg px-10 py-3 pr-12 outline-none border transition duration-300 ${
                isDarkMode
                  ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:ring-blue-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-blue-500"
              } focus:ring-2`}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
              className={`absolute right-3 top-3 transition ${
                isDarkMode
                  ? "text-gray-400 hover:text-blue-400"
                  : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {message && (
            <p
              className={`text-sm ${isDarkMode ? "text-red-400" : "text-red-600"}`}
            >
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-60"
          >
            {isLoading ? "Updating..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
