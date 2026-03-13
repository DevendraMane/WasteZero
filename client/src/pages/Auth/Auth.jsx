import React, { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import loader from "../../assets/loader.png";
import MaintenancePage from "../../components/MaintenancePage";
import { useAuth } from "../../store/AuthContext";
import { fetchSettings } from "../../utils/settingsApi";

const Auth = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const path = location.pathname;

  // Fetch settings on mount to check maintenance mode
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await fetchSettings();
        if (data) {
          setSettings(data);
        }
      } catch (error) {
        console.error("Failed to load settings:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const getWidth = () => {
    if (path.includes("register")) return "max-w-2xl";
    if (path.includes("forgot-password")) return "max-w-lg";
    return "max-w-md"; // login & reset default
  };

  // Show maintenance page if maintenance mode is active and user is not admin
  const isMaintenanceActive =
    settings?.maintenanceMode && user?.role !== "admin";
  const maintenanceMessage = settings?.maintenanceMessage;

  if (!loading && isMaintenanceActive) {
    return <MaintenancePage message={maintenanceMessage} isAdmin={false} />;
  }

  // Show admin notice if maintenance is active and user is admin
  const isAdminDuringMaintenance =
    settings?.maintenanceMode && user?.role === "admin";

  return (
    <div className="min-h-dvh flex bg-linear-to-br from-green-700 via-emerald-600 to-green-500 relative overflow-x-hidden overflow-y-auto">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {isAdminDuringMaintenance && (
        <div className="fixed top-0 left-0 right-0 z-20 bg-blue-600 text-white py-3 px-4 text-center font-semibold text-sm md:text-base">
          ⚠️ Maintenance Mode is Active - Only admins can access the platform
        </div>
      )}

      {/* LEFT SIDE */}
      <div
        className={`hidden md:flex flex-col justify-center px-24 text-white w-1/2 py-20 relative z-10 ${
          isAdminDuringMaintenance ? "pt-16 md:pt-24" : ""
        }`}
      >
        <div className="flex items-center gap-4 mb-16">
          <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md shadow-lg">
            <img
              src={loader}
              alt="WasteZero Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <span className="text-3xl font-bold tracking-wide">WasteZero</span>
        </div>

        <h1 className="text-5xl font-extrabold mb-6 leading-tight max-w-xl">
          Join the Recycling Revolution
        </h1>

        <p className="text-lg text-green-100 mb-14 max-w-lg leading-relaxed">
          WasteZero connects volunteers, NGOs, and administrators to schedule
          pickups and create meaningful environmental impact.
        </p>
      </div>

      {/* RIGHT SIDE */}
      <div
        className={`flex justify-center items-center w-full md:w-1/2 px-4 sm:px-6 py-8 sm:py-12 relative z-10 ${
          isAdminDuringMaintenance ? "pt-16 md:pt-24" : ""
        }`}
      >
        <div className="w-full max-w-4xl">
          <div className="md:hidden mb-5 text-white relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md shadow-lg">
                <img
                  src={loader}
                  alt="WasteZero Logo"
                  className="w-8 h-8 object-contain"
                />
              </div>
              <span className="text-2xl font-bold tracking-wide">WasteZero</span>
            </div>
            <p className="text-sm text-green-100 leading-relaxed">
              Join volunteers and NGOs to create real environmental impact.
            </p>
          </div>

        <div
          className={`
            bg-white
            p-5 sm:p-8 md:p-10
            rounded-2xl sm:rounded-3xl
            shadow-2xl 
            w-full
            md:max-h-[90vh]
            overflow-y-auto
            ${getWidth()}
            transition-all 
            duration-600 
            ease-in-out
          `}
        >
          <Outlet />
          {/* Google login note & Admin info */}
          {(path.includes("login") || path.includes("register")) && (
            <div className="mt-6 text-sm text-gray-500 text-center leading-relaxed space-y-2">
              <p>Google login: Volunteers only. NGOs require verification.</p>
              {path.includes("register") && (
                <p className="text-xs text-gray-400">
                  💡 Pro tip: Select "Admin" during registration and enter the
                  admin code to create an admin account
                </p>
              )}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
