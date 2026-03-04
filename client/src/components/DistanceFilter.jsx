import React from "react";

const DistanceFilter = ({ distance, setDistance }) => {
  const maxDistance = 500;

  const presets = [50, 100, 200, 300, 400, 500];

  const percent = (distance / maxDistance) * 100;

  const ticks = Array.from({ length: 11 }, (_, i) => i * 50); // 0-500 every 50

  return (
    <div className="bg-white p-4 rounded-xl shadow-md space-y-4">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <h3 className="font-medium text-gray-800 text-sm">Distance Filter</h3>

        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-xs font-medium">
          {distance} km
        </span>
      </div>

      {/* SLIDER */}

      <div className="relative">
        {/* TRACK */}

        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-200 rounded -translate-y-1/2"></div>

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
                tick % 100 === 0 ? "h-3 bg-gray-500" : "h-2 bg-gray-300"
              }`}
            ></div>

            {/* Label only for 100 intervals */}

            {tick % 100 === 0 && (
              <span className="text-[10px] text-gray-400 mt-1">{tick}</span>
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
                  : "bg-gray-100 text-gray-700 hover:bg-green-50"
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
