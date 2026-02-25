import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";
import { useAuth } from "../../store/AuthContext";
import { useNavigate } from "react-router-dom";

const Opportunities = () => {
  const { authorizationToken, API, user } = useAuth();
  const [appliedMap, setAppliedMap] = useState({});
  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [applyingId, setApplyingId] = useState(null);

  const navigate = useNavigate();

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get(`${API}/api/opportunities`, {
        headers: {
          Authorization: authorizationToken,
        },
      });

      setOpportunities(res.data);
    } catch (error) {
      console.error(
        "Error fetching opportunities:",
        error.response?.data || error,
      );
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  useEffect(() => {
    const fetchAppliedStatus = async () => {
      if (user?.role !== "volunteer") return;

      const statusMap = {};

      for (let opp of opportunities) {
        const res = await axios.get(
          `${API}/api/applications/check/${opp._id}`,
          { headers: { Authorization: authorizationToken } },
        );

        if (res.data.applied) {
          statusMap[opp._id] = res.data.status;
        } else {
          statusMap[opp._id] = null;
        }
      }

      setAppliedMap(statusMap);
    };

    if (opportunities.length > 0) {
      fetchAppliedStatus();
    }
  }, [opportunities]);

  // 🔹 APPLY FUNCTION
  const handleApply = async (id) => {
    try {
      await axios.post(
        `${API}/api/applications/${id}`,
        {},
        { headers: { Authorization: authorizationToken } },
      );

      setAppliedMap((prev) => ({ ...prev, [id]: "pending" }));
    } catch (error) {
      alert(error.response?.data?.message || "Already applied");
    }
  };

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

        {/* Show only if NGO */}
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

      {/* CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {opportunities.length === 0 ? (
          <div className="col-span-full text-center text-gray-400 py-16 border border-dashed rounded-xl">
            No opportunities available
          </div>
        ) : (
          opportunities.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl transition duration-300 overflow-hidden"
            >
              {/* IMAGE */}
              <div className="h-48 overflow-hidden">
                <img
                  src={`${API}/uploads/${item.image}`}
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

                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Open
                  </span>
                </div>

                <p className="text-gray-500 text-sm line-clamp-3">
                  {item.description}
                </p>

                <div className="flex justify-between text-sm text-gray-500">
                  <span>📍 {item.location}</span>
                  <span>⏱ {item.duration}</span>
                </div>

                {/* BUTTONS */}
                <div className="space-y-2">
                  <button
                    onClick={() => navigate(`/opportunities/${item._id}`)}
                    className="w-full bg-gray-100 hover:bg-green-100 text-gray-700 font-medium py-2 rounded-lg transition"
                  >
                    View Details
                  </button>

                  {/* 🔥 Apply Now (Volunteer Only) */}
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
                    ) : (
                      <button
                        onClick={() => handleApply(item._id)}
                        className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                      >
                        Apply Now
                      </button>
                    ))}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Opportunities;
