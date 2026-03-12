import React from "react";
import loader from "../assets/loader.png";

const MaintenancePage = ({ message, isAdmin = false }) => {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-green-700 via-emerald-600 to-green-500 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10 backdrop-blur-sm" />

      {/* DECORATIVE ELEMENTS */}
      <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl" />

      {/* MAIN CONTENT */}
      <div className="flex justify-center items-center w-full px-6 py-12 relative z-10">
        <div className="bg-white p-12 rounded-3xl shadow-2xl w-full max-w-md text-center space-y-8">
          {/* LOGO */}
          <div className="flex justify-center">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-2xl shadow-lg">
              <img
                src={loader}
                alt="WasteZero Logo"
                className="w-20 h-20 object-contain opacity-80"
              />
            </div>
          </div>

          {/* MAINTENANCE ICON */}
          <div className="text-6xl">🔧</div>

          {/* HEADING */}
          <div className="space-y-2">
            <h1 className="text-4xl font-bold text-gray-800">
              Under Maintenance
            </h1>
            <p className="text-gray-500 text-sm">
              We're working to improve your experience
            </p>
          </div>

          {/* MAINTENANCE MESSAGE */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
            <p className="text-amber-900 font-medium text-lg leading-relaxed">
              {message ||
                "WasteZero is currently under maintenance. We're making improvements and will be back online shortly."}
            </p>
            <p className="text-amber-700 text-sm">
              We expect to be back up and running very soon. Thank you for your
              patience!
            </p>
          </div>

          {/* ESTIMATED TIME */}
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <span className="text-2xl">⏱️</span>
            <p className="text-sm">
              Estimated time:{" "}
              <span className="font-semibold">30-60 minutes</span>
            </p>
          </div>

          {/* ADMIN BYPASS NOTICE */}
          {isAdmin && (
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
              <p className="text-blue-900 text-xs font-semibold">
                ✓ Admin Access Granted
              </p>
              <p className="text-blue-700 text-xs mt-1">
                You have admin privileges and can access the platform during
                maintenance.
              </p>
            </div>
          )}

          {/* CONTACT INFO */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-gray-600 text-sm mb-3">Need help?</p>
            <a
              href="mailto:support@wastezero.com"
              className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-200 shadow-md hover:shadow-lg"
            >
              📧 Contact Support
            </a>
          </div>

          {/* FOOTER NOTE */}
          <div className="flex items-center justify-center gap-2 text-gray-400 text-xs">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>We'll notify you when we're back online</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenancePage;
