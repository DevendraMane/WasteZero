import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import loader from "../../assets/loader.png";

const Auth = () => {
  const location = useLocation();

  const path = location.pathname;

  const getWidth = () => {
    if (path.includes("register")) return "max-w-2xl";
    if (path.includes("forgot-password")) return "max-w-lg";
    return "max-w-md"; // login & reset default
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-700 via-emerald-600 to-green-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center px-24 text-white w-1/2 py-20 relative z-10">
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
      <div className="flex justify-center items-center w-full md:w-1/2 px-6 py-12 relative z-10">
        <div
          className={`
            bg-white 
            p-10 
            rounded-3xl 
            shadow-2xl 
            w-full
            ${getWidth()}
            transition-all 
            duration-600 
            ease-[cubic-bezier(0.4,0,0.2,1)]
          `}
        >
          <Outlet />
          {/* Google login note */}
          {(path.includes("login") || path.includes("register")) && (
            <p className="mt-6 text-sm text-gray-500 text-center leading-relaxed">
              Google login: Volunteers only. NGOs require verification.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Auth;
