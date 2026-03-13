import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "../../utils/calculateDistance";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";
import DistanceFilter from "../../components/DistanceFilter";

const ITEMS_PER_PAGE = 6;

const Opportunities = () => {
  const { authorizationToken, API, user } = useAuth();
  const [appliedMap, setAppliedMap] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const { isDarkMode } = useDarkMode();
  const [totalPages, setTotalPages] = useState(1);

  const navigate = useNavigate();

  const fetchOpportunities = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API}/api/opportunities?page=${currentPage}&limit=${ITEMS_PER_PAGE}`,
        {
          headers: { Authorization: authorizationToken },
        },
      );

      setOpportunities(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [currentPage]);

  useEffect(() => {
    const fetchAppliedStatus = async () => {
      if (user?.role !== "volunteer") return;
      const statusMap = {};
      for (let opp of opportunities) {
        try {
          const res = await axios.get(
            `${API}/api/applications/check/${opp._id}`,
            { headers: { Authorization: authorizationToken } },
          );
          statusMap[opp._id] = res.data.applied ? res.data.status : null;
        } catch (err) {
          console.error(err);
        }
      }
      setAppliedMap(statusMap);
    };
    if (opportunities.length > 0) fetchAppliedStatus();
  }, [opportunities]);

  const handleApply = async (id) => {
    try {
      setApplyingId(id);
      await axios.post(
        `${API}/api/applications/${id}`,
        {},
        { headers: { Authorization: authorizationToken } },
      );
      setAppliedMap((prev) => ({ ...prev, [id]: "pending" }));
    } catch (error) {
      alert(error.response?.data?.message || "Already applied");
    } finally {
      setApplyingId(null);
    }
  };

  /* ================= DISTANCE FILTER ================= */
  const filteredOpportunities = opportunities.filter((opp) => {
    if (!user?.latitude || !user?.longitude) return true;
    if (!opp.latitude || !opp.longitude) return true;
    const distance = calculateDistance(
      user.latitude,
      user.longitude,
      opp.latitude,
      opp.longitude,
    );
    return distance <= maxDistance;
  });

  /* ================= PAGINATION ================= */
  const paginatedOpportunities = filteredOpportunities;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [maxDistance]);

  if (loading) return <Loader />;

  return (
    <div
      className={`space-y-8 p-8 rounded-lg transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1
            className={`text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
          >
            Volunteer Opportunities
          </h1>
          <p
            className={`mt-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Browse and manage waste management initiatives
          </p>
        </div>
        {user?.role === "ngo" && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
          >
            + Create Opportunity
          </button>
        )}
      </div>

      {/* FORM MODAL */}
      {showForm && (
        <CreateOpportunity
          onClose={() => setShowForm(false)}
          onCreated={fetchOpportunities}
        />
      )}

      {/* DISTANCE FILTER */}
      {user?.role === "volunteer" && (
        <DistanceFilter
          distance={maxDistance}
          setDistance={(value) => setMaxDistance(Number(value))}
        />
      )}

      {/* RESULTS COUNT
      {filteredOpportunities.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {(currentPage - 1) * ITEMS_PER_PAGE + 1}–
            {Math.min(
              currentPage * ITEMS_PER_PAGE,
              filteredOpportunities.length,
            )}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {filteredOpportunities.length}
          </span>{" "}
          opportunities
        </div>
      )} */}

      {/* OPPORTUNITY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {paginatedOpportunities.length === 0 ? (
          <div
            className={`col-span-full text-center py-16 border border-dashed rounded-xl transition duration-300 ${
              isDarkMode
                ? "text-gray-400 border-gray-700 bg-gray-900"
                : "text-gray-400 border-gray-300 bg-white"
            }`}
          >
            No opportunities within selected distance
          </div>
        ) : (
          paginatedOpportunities.map((item) => {
            let distance = null;
            if (
              user?.latitude &&
              user?.longitude &&
              item.latitude &&
              item.longitude
            ) {
              distance = calculateDistance(
                user.latitude,
                user.longitude,
                item.latitude,
                item.longitude,
              ).toFixed(1);
            }

            return (
              <div
                key={item._id}
                className={`rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      item.image ||
                      "https://via.placeholder.com/400x250?text=Opportunity"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3
                      className={`text-lg font-semibold transition duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </h3>
                    {new Date(item.date) < new Date() ? (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition duration-300 ${
                          isDarkMode
                            ? "bg-red-900 text-red-200"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        Closed
                      </span>
                    ) : (
                      <span
                        className={`text-xs font-semibold px-3 py-1 rounded-full transition duration-300 ${
                          isDarkMode
                            ? "bg-green-900 text-green-200"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        Open
                      </span>
                    )}
                  </div>

                  <p
                    className={`text-sm line-clamp-3 transition duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </p>

                  <div
                    className={`flex justify-between items-center text-sm gap-3 transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    <span
                      className="flex items-center gap-1 truncate max-w-[70%]"
                      title={item.location}
                    >
                      📍 {item.location}
                    </span>
                    <span className="whitespace-nowrap">⏱ {item.duration}</span>
                  </div>

                  {distance && (
                    <div className="text-sm text-green-600 font-medium">
                      📏 {distance} km away
                    </div>
                  )}

                  <div
                    className={`text-sm transition duration-300 ${
                      isDarkMode ? "text-gray-400" : "text-gray-500"
                    }`}
                  >
                    📅 {new Date(item.date).toLocaleDateString()}
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/opportunities/${item._id}`)}
                      className={`w-full font-medium py-2 rounded-lg transition duration-300 ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-200 hover:bg-gray-600"
                          : "bg-gray-100 hover:bg-green-100 text-gray-700"
                      }`}
                    >
                      View Details
                    </button>

                    {user?.role === "volunteer" &&
                      (appliedMap[item._id] === "accepted" ? (
                        <button
                          disabled
                          className="w-full bg-green-600 text-white font-medium py-2 rounded-lg"
                        >
                          Accepted
                        </button>
                      ) : appliedMap[item._id] === "pending" ? (
                        <button
                          disabled
                          className={`w-full font-medium py-2 rounded-lg transition duration-300 ${
                            isDarkMode
                              ? "bg-yellow-900 text-yellow-200"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          Applied (Pending)
                        </button>
                      ) : appliedMap[item._id] === "rejected" ? (
                        <button
                          disabled
                          className={`w-full font-medium py-2 rounded-lg transition duration-300 ${
                            isDarkMode
                              ? "bg-red-900 text-red-200"
                              : "bg-red-100 text-red-600"
                          }`}
                        >
                          Rejected
                        </button>
                      ) : new Date(item.date) < new Date() ? (
                        <button
                          disabled
                          className={`w-full py-2 rounded-lg cursor-not-allowed transition duration-300 ${
                            isDarkMode
                              ? "bg-gray-700 text-gray-500"
                              : "bg-gray-200 text-gray-500"
                          }`}
                        >
                          Opportunity Closed
                        </button>
                      ) : (
                        <button
                          onClick={() => handleApply(item._id)}
                          disabled={applyingId === item._id}
                          className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                        >
                          {applyingId === item._id
                            ? "Applying..."
                            : "Apply Now"}
                        </button>
                      ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          {/* Prev button */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition duration-300 ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            ← Prev
          </button>

          {/* Page numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`w-9 h-9 rounded-lg text-sm font-semibold transition duration-300 ${
                currentPage === page
                  ? "bg-green-600 text-white shadow-sm"
                  : isDarkMode
                    ? "border border-gray-700 text-gray-300 hover:bg-gray-700"
                    : "border border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {page}
            </button>
          ))}

          {/* Next button */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-lg border text-sm font-medium transition duration-300 ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
                : "border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            }`}
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
};

export default Opportunities;
