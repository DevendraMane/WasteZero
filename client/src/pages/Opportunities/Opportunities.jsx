import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";
import { calculateDistance } from "../../utils/calculateDistance";
import DistanceFilter from "../../components/DistanceFilter";
import Loader from "../../components/Loader";
const Opportunities = () => {
  const { authorizationToken, API, user } = useAuth();
  const [appliedMap, setAppliedMap] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [applyingId, setApplyingId] = useState(null);
  const [maxDistance, setMaxDistance] = useState(50);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  /* ================= FETCH OPPORTUNITIES ================= */

  const fetchOpportunities = async () => {
    try {
      setLoading(true);

      const res = await axios.get(`${API}/api/opportunities`, {
        headers: { Authorization: authorizationToken },
      });

      setOpportunities(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  /* ================= FETCH APPLICATION STATUS ================= */

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

    if (opportunities.length > 0) {
      fetchAppliedStatus();
    }
  }, [opportunities]);

  /* ================= APPLY FUNCTION ================= */

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

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Volunteer Opportunities
          </h1>
          <p className="text-gray-500 mt-2">
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

      {/* OPPORTUNITY CARDS */}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredOpportunities.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-16 border border-dashed rounded-xl">
            No opportunities within selected distance
          </div>
        ) : (
          filteredOpportunities.map((item) => {
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
                className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
              >
                {/* IMAGE */}

                <div className="h-48 overflow-hidden">
                  <img
                    src={
                      item.image
                        ? item.image
                        : "https://via.placeholder.com/400x250?text=Opportunity"
                    }
                    alt={item.title}
                    className="w-full h-full object-cover hover:scale-105 transition duration-500"
                  />
                </div>

                {/* CONTENT */}

                <div className="p-6 space-y-4">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-800">
                      {item.title}
                    </h3>

                    {new Date(item.date) < new Date() ? (
                      <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
                        Closed
                      </span>
                    ) : (
                      <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                        Open
                      </span>
                    )}
                  </div>

                  <p className="text-gray-500 text-sm line-clamp-3">
                    {item.description}
                  </p>

                  <div className="flex justify-between items-center text-sm text-gray-500 gap-3">
                    <span
                      className="flex items-center gap-1 truncate max-w-[70%]"
                      title={item.location}
                    >
                      📍 {item.location}
                    </span>

                    <span className="whitespace-nowrap">⏱ {item.duration}</span>
                  </div>

                  {/* DISTANCE */}

                  {distance && (
                    <div className="text-sm text-green-600 font-medium">
                      📏 {distance} km away
                    </div>
                  )}

                  <div className="text-sm text-gray-500">
                    📅 {new Date(item.date).toLocaleDateString()}
                  </div>

                  {/* BUTTONS */}

                  <div className="space-y-2">
                    <button
                      onClick={() => navigate(`/opportunities/${item._id}`)}
                      className="w-full bg-gray-100 hover:bg-green-100 text-gray-700 font-medium py-2 rounded-lg transition"
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
                          className="w-full bg-yellow-100 text-yellow-700 font-medium py-2 rounded-lg"
                        >
                          Applied (Pending)
                        </button>
                      ) : appliedMap[item._id] === "rejected" ? (
                        <button
                          disabled
                          className="w-full bg-red-100 text-red-600 font-medium py-2 rounded-lg"
                        >
                          Rejected
                        </button>
                      ) : new Date(item.date) < new Date() ? (
                        <button
                          disabled
                          className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed"
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
    </div>
  );
};

export default Opportunities;
