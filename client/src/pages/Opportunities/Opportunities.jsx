import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "../../utils/calculateDistance";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";
import DistanceFilter from "../../components/DistanceFilter";
import { transformCloudinaryImage } from "../../utils/image";
import { devError } from "../../utils/logger";
import { showError, showSuccess } from "../../utils/alert";

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

  const canUseDistanceFilter = ["volunteer", "ngo"].includes(user?.role);

  const hasUserCoords =
    canUseDistanceFilter &&
    Number.isFinite(Number(user?.latitude)) &&
    Number.isFinite(Number(user?.longitude));

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: String(currentPage),
        limit: String(ITEMS_PER_PAGE),
      });

      if (hasUserCoords) {
        params.append("latitude", String(Number(user.latitude)));
        params.append("longitude", String(Number(user.longitude)));
        params.append("maxDistance", String(maxDistance));
      }

      const res = await axios.get(
        `${API}/api/opportunities?${params.toString()}`,
        {
          headers: { Authorization: authorizationToken },
        },
      );

      setOpportunities(res.data.data);
      setTotalPages(res.data.totalPages || 1);
    } catch (error) {
      devError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, [currentPage, maxDistance, user?.role, user?.latitude, user?.longitude]);

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
          devError(err);
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
      showSuccess("Application submitted successfully");
    } catch (error) {
      showError(error.response?.data?.message || "Already applied");
    } finally {
      setApplyingId(null);
    }
  };

  /* ================= DISTANCE FILTER ================= */
  const filteredOpportunities = opportunities.filter((opp) => {
    if (!hasUserCoords) return true;

    const oppLat = Number(opp.latitude);
    const oppLng = Number(opp.longitude);

    if (!Number.isFinite(oppLat) || !Number.isFinite(oppLng)) return false;

    const distance = calculateDistance(
      Number(user.latitude),
      Number(user.longitude),
      oppLat,
      oppLng,
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
      className={`space-y-6 sm:space-y-8 p-4 sm:p-6 lg:p-8 rounded-lg transition duration-300 ${
        isDarkMode ? "bg-gray-900" : "bg-gray-50"
      }`}
    >
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-800"}`}
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
            className="w-full sm:w-auto bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
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
      {canUseDistanceFilter && (
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
              hasUserCoords &&
              Number.isFinite(Number(item.latitude)) &&
              Number.isFinite(Number(item.longitude))
            ) {
              distance = calculateDistance(
                Number(user.latitude),
                Number(user.longitude),
                Number(item.latitude),
                Number(item.longitude),
              ).toFixed(1);
            }

            return (
              <div
                key={item._id}
                className={`rounded-xl border shadow-sm hover:shadow-md transition duration-300 overflow-hidden ${
                  isDarkMode ? "bg-gray-800" : "bg-white"
                }`}
              >
                <div className="relative h-36 sm:h-40 overflow-hidden">
                  <img
                    src={
                      transformCloudinaryImage(item.image, {
                        width: 600,
                        height: 360,
                      }) ||
                      "https://via.placeholder.com/400x250?text=Opportunity"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />

                  {new Date(item.date) < new Date() ? (
                    <span
                      className={`absolute top-2 right-2 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm transition duration-300 ${
                        isDarkMode
                          ? "bg-red-900/90 text-red-200"
                          : "bg-red-100/95 text-red-600"
                      }`}
                    >
                      Closed
                    </span>
                  ) : (
                    <span
                      className={`absolute top-2 right-2 text-[11px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm transition duration-300 ${
                        isDarkMode
                          ? "bg-green-900/90 text-green-200"
                          : "bg-green-100/95 text-green-700"
                      }`}
                    >
                      Open
                    </span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <h3
                      className={`text-base font-semibold leading-snug line-clamp-2 transition duration-300 ${
                        isDarkMode ? "text-white" : "text-gray-800"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  <p
                    className={`text-sm line-clamp-2 transition duration-300 ${
                      isDarkMode ? "text-gray-300" : "text-gray-500"
                    }`}
                  >
                    {item.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 text-xs">
                    <span
                      className={`inline-flex items-center gap-1 max-w-full truncate px-2.5 py-1 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                      title={item.location}
                    >
                      {item.location}
                    </span>

                    <span
                      className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {item.duration}
                    </span>

                    <span
                      className={`inline-flex items-center whitespace-nowrap px-2.5 py-1 rounded-full ${
                        isDarkMode
                          ? "bg-gray-700 text-gray-300"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {new Date(item.date).toLocaleDateString()}
                    </span>
                  </div>

                  {distance && (
                    <div
                      className={`text-xs font-medium ${
                        isDarkMode ? "text-green-400" : "text-green-600"
                      }`}
                    >
                      {distance} km away
                    </div>
                  )}

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/opportunities/${item._id}`)}
                      className={`w-full text-sm font-medium py-2 rounded-lg transition duration-300 ${
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
                          className="w-full bg-green-600 text-white text-sm font-medium py-2 rounded-lg"
                        >
                          Accepted
                        </button>
                      ) : appliedMap[item._id] === "pending" ? (
                        <button
                          disabled
                          className={`w-full text-sm font-medium py-2 rounded-lg transition duration-300 ${
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
                          className={`w-full text-sm font-medium py-2 rounded-lg transition duration-300 ${
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
                          className={`w-full text-sm py-2 rounded-lg cursor-not-allowed transition duration-300 ${
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
                          className="w-full bg-green-600 text-white text-sm py-2 rounded-lg hover:bg-green-700"
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
        <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
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
