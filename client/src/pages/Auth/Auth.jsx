import React from "react";
import { Outlet } from "react-router-dom";

const Auth = () => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-600 to-emerald-400 overflow-y-auto">
      {/* LEFT SIDE */}
      <div className="hidden md:flex flex-col justify-center px-20 text-white w-1/2 py-20">
        <h1 className="text-6xl font-bold mb-8 leading-tight">
          Join the Recycling Revolution
        </h1>

        <p className="text-xl mb-12 text-green-100 max-w-xl">
          WasteZero connects volunteers, NGOs, and administrators to schedule
          pickups, manage recycling opportunities, and make a real environmental
          impact.
        </p>

        <div className="flex gap-16">
          <div>
            <h3 className="font-semibold text-lg mb-2">Schedule Pickups</h3>
            <p className="text-green-100 text-sm">
              Easily arrange waste collection
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Track Impact</h3>
            <p className="text-green-100 text-sm">
              Monitor environmental contribution
            </p>
          </div>

          <div>
            <h3 className="font-semibold text-lg mb-2">Volunteer</h3>
            <p className="text-green-100 text-sm">Join recycling initiatives</p>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex justify-center w-full md:w-1/2 p-10 py-20">
        <div className="bg-white/95 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Auth;
