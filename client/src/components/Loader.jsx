import React from "react";
import loader from "../assets/loader.png";

const Loader = ({ fullScreen = false }) => {
  return (
    <div
      className={`flex items-center justify-center ${
        fullScreen ? "fixed inset-0 bg-black/30 backdrop-blur-md z-50" : ""
      }`}
    >
      <div className="flex flex-col items-center gap-4">
        <img
          src={loader}
          alt="Loading..."
          className="w-16 h-16 animate-spin drop-shadow-lg"
        />
        <p className="text-white text-sm font-medium">Please wait...</p>
      </div>
    </div>
  );
};

export default Loader;
