import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useDarkMode } from "../store/DarkModeContext";

const SearchBar = () => {
  const navigate = useNavigate();
  const { API, authorizationToken, user } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState({
    opportunities: [],
    pickups: [],
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const dropdownRef = useRef(null);

  /* ================= SEARCH API CALL ================= */

  const performSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      setSuggestions({ opportunities: [], pickups: [] });
      setShowSuggestions(false);
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(
        `${API}/api/opportunities/search/all?q=${encodeURIComponent(query)}`,
        {
          headers: { Authorization: authorizationToken },
        },
      );

      const data = await res.json();
      setSuggestions(data);
      setShowSuggestions(true);
    } catch (error) {
      console.error("Search error:", error);
      setSuggestions({ opportunities: [], pickups: [] });
    } finally {
      setLoading(false);
    }
  };

  /* ================= DEBOUNCE SEARCH ================= */

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);

    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      performSearch(value);
    }, 300);

    setDebounceTimer(timer);
  };

  /* ================= HANDLE OPPORTUNITY SELECTION ================= */

  const handleOpportunityClick = (id) => {
    setSearchQuery("");
    setSuggestions({ opportunities: [], pickups: [] });
    setShowSuggestions(false);
    navigate(`/opportunities/${id}`);
  };

  /* ================= HANDLE PICKUP SELECTION ================= */

  const handlePickupClick = () => {
    setSearchQuery("");
    setSuggestions({ opportunities: [], pickups: [] });
    setShowSuggestions(false);
    // Redirect to schedule/pickups page based on user role
    if (user?.role === "ngo") {
      navigate("/ngo-pickups");
    } else if (user?.role === "volunteer") {
      navigate("/schedule");
    }
  };

  /* ================= CLOSE DROPDOWN ON OUTSIDE CLICK ================= */

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const totalResults =
    suggestions.opportunities.length + suggestions.pickups.length;

  return (
    <div className="relative w-full max-w-2xl" ref={dropdownRef}>
      <input
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={handleSearchChange}
        onFocus={() =>
          searchQuery && totalResults > 0 && setShowSuggestions(true)
        }
        className={`w-full rounded-lg pl-3 pr-8 py-2 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-300 ${
          isDarkMode
            ? "bg-gray-700 border border-gray-600 text-white placeholder-gray-400"
            : "bg-white border border-gray-300 text-gray-900 placeholder-gray-500"
        }`}
      />

      {/* SEARCH ICON */}
      <span
        className={`absolute right-3 top-1/2 -translate-y-1/2 ${
          isDarkMode ? "text-gray-500" : "text-gray-400"
        }`}
      >
        🔍
      </span>

      {/* SUGGESTIONS DROPDOWN */}
      {showSuggestions && (
        <div
          className={`absolute top-full left-0 right-0 mt-2 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto transition duration-300 ${
            isDarkMode
              ? "bg-gray-700 border border-gray-600"
              : "bg-white border border-gray-300"
          }`}
        >
          {loading && (
            <div
              className={`p-4 text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              Searching...
            </div>
          )}

          {!loading && totalResults === 0 && searchQuery && (
            <div
              className={`p-4 text-center ${
                isDarkMode ? "text-gray-400" : "text-gray-500"
              }`}
            >
              No results found for "{searchQuery}"
            </div>
          )}

          {!loading && totalResults > 0 && (
            <>
              {/* OPPORTUNITIES SECTION */}
              {suggestions.opportunities.length > 0 && (
                <div>
                  <div
                    className={`px-4 py-2 border-b sticky top-0 transition duration-300 ${
                      isDarkMode
                        ? "bg-green-900 border-gray-600"
                        : "bg-green-50 border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-green-300" : "text-green-700"
                      }`}
                    >
                      🎯 OPPORTUNITIES ({suggestions.opportunities.length})
                    </p>
                  </div>
                  {suggestions.opportunities.map((opp) => (
                    <div
                      key={opp._id}
                      onClick={() => handleOpportunityClick(opp._id)}
                      className={`px-4 py-3 border-b cursor-pointer transition ${
                        isDarkMode
                          ? "hover:bg-green-800 border-gray-600"
                          : "hover:bg-green-50 border-gray-200"
                      }`}
                    >
                      <div className="flex gap-3">
                        {opp.image && (
                          <img
                            src={opp.image}
                            alt={opp.title}
                            className="w-12 h-12 rounded object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p
                            className={`font-semibold text-sm ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {opp.title}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            📍 {opp.location}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {opp.ngoName}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* PICKUPS SECTION */}
              {suggestions.pickups.length > 0 && (
                <div>
                  <div
                    className={`px-4 py-2 border-b sticky top-12 transition duration-300 ${
                      isDarkMode
                        ? "bg-blue-900 border-gray-600"
                        : "bg-blue-50 border-gray-200"
                    }`}
                  >
                    <p
                      className={`text-xs font-semibold ${
                        isDarkMode ? "text-blue-300" : "text-blue-700"
                      }`}
                    >
                      🗑️ PICKUPS ({suggestions.pickups.length})
                    </p>
                  </div>
                  {suggestions.pickups.map((pickup) => (
                    <div
                      key={pickup._id}
                      onClick={handlePickupClick}
                      className={`px-4 py-3 border-b cursor-pointer transition ${
                        isDarkMode
                          ? "hover:bg-blue-800 border-gray-600"
                          : "hover:bg-blue-50 border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              isDarkMode ? "text-white" : "text-gray-800"
                            }`}
                          >
                            {pickup.category}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-400" : "text-gray-500"
                            }`}
                          >
                            📍 {pickup.location}
                          </p>
                          <p
                            className={`text-xs ${
                              isDarkMode ? "text-gray-500" : "text-gray-400"
                            }`}
                          >
                            {pickup.userName}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            pickup.status === "pending"
                              ? "bg-yellow-100 text-yellow-700"
                              : pickup.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {pickup.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
