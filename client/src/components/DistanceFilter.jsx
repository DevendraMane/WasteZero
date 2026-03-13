import React from "react";
import { useDarkMode } from "../store/DarkModeContext";

const DistanceFilter = ({ distance, setDistance }) => {
  const { isDarkMode } = useDarkMode();
  const maxDistance = 500;

  const presets = [50, 100, 200, 300, 400, 500];

  const percent = (distance / maxDistance) * 100;

  const ticks = Array.from({ length: 11 }, (_, i) => i * 50); // 0-500 every 50

  return (
    <div
      className={`p-4 rounded-xl shadow-md space-y-4 transition duration-300 ${
        isDarkMode ? "bg-gray-800" : "bg-white"
      }`}
    >
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h3
          className={`font-medium text-sm transition duration-300 ${
            isDarkMode ? "text-gray-200" : "text-gray-800"
          }`}
        >
          Distance Filter
        </h3>

        <span
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition duration-300 ${
            isDarkMode
              ? "bg-green-900 text-green-200"
              : "bg-green-100 text-green-700"
          }`}
        >
          {distance} km
        </span>
      </div>

      {/* SLIDER */}

      <div className="relative">
        {/* TRACK */}

        <div
          className={`absolute top-1/2 left-0 w-full h-1.5 rounded -translate-y-1/2 transition duration-300 ${
            isDarkMode ? "bg-gray-700" : "bg-gray-200"
          }`}
        ></div>

        {/* PROGRESS */}

        <div
          className="absolute top-1/2 left-0 h-1.5 bg-green-500 rounded -translate-y-1/2"
          style={{ width: `${percent}%` }}
        ></div>

        {/* INPUT */}

        <input
          type="range"
          min="0"
          max={maxDistance}
          step="10"
          value={distance}
          onChange={(e) => setDistance(Number(e.target.value))}
          className="w-full appearance-none bg-transparent cursor-pointer relative z-10"
        />
      </div>

      {/* RULER TICKS */}

      <div className="relative flex justify-between items-start px-1 h-4">
        {ticks.map((tick, index) => (
          <div key={index} className="flex flex-col items-center">
            {/* Tick line */}

            <div
              className={`w-px ${
                tick % 100 === 0
                  ? isDarkMode
                    ? "h-3 bg-gray-400"
                    : "h-3 bg-gray-500"
                  : isDarkMode
                  ? "h-2 bg-gray-600"
                  : "h-2 bg-gray-300"
              }`}
            ></div>

            {/* Label only for 100 intervals */}

            {tick % 100 === 0 && (
              <span
                className={`text-[10px] mt-1 transition duration-300 ${
                  isDarkMode ? "text-gray-500" : "text-gray-400"
                }`}
              >
                {tick}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* PRESET BUTTONS */}

      <div className="flex flex-wrap gap-1.5 pt-1">
        {presets.map((p) => (
          <button
            key={p}
            onClick={() => setDistance(p)}
            className={`px-2.5 py-0.5 rounded-full text-xs border transition
              ${
                distance === p
                  ? "bg-green-600 text-white border-green-600"
                  : isDarkMode
                  ? "bg-gray-700 text-gray-300 border-gray-600 hover:bg-gray-600"
                  : "bg-gray-100 text-gray-700 border-gray-200 hover:bg-green-50"
              }`}
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DistanceFilter;
