import React from "react";

const Topbar = () => {
  return (
    <div className="topbar">
      <input
        type="text"
        placeholder="Search pickups, opportunities..."
        className="search"
      />

      <div className="icons">🔔 👤</div>
    </div>
  );
};

export default Topbar;
