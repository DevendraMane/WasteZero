import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { useDarkMode } from "../../store/DarkModeContext";
import Loader from "../../components/Loader";
import { devError } from "../../utils/logger";
import { showError, showSuccess, showWarning } from "../../utils/alert";

const PICKUP_BATCH_SIZE = 6;

const PickupManagement = () => {
  const { API, authorizationToken } = useAuth();
  const { isDarkMode } = useDarkMode();

  const [pickups, setPickups] = useState([]);

  /* SAMPLE AGENTS */
  const [agents] = useState([
    {
      _id: "agent1",
      name: "Rahul Patil",
      phone: "+91 9876543210",
      vehicle: "Waste Collection Van",
    },
    {
      _id: "agent2",
      name: "Amit Sharma",
      phone: "+91 9123456780",
      vehicle: "Electric Waste Truck",
    },
    {
      _id: "agent3",
      name: "Suresh Yadav",
      phone: "+91 9988776655",
      vehicle: "Recycling Pickup Truck",
    },
    {
      _id: "agent4",
      name: "Imran Khan",
      phone: "+91 9090909090",
      vehicle: "Municipal Waste Van",
    },
  ]);

  const [selectedAgent, setSelectedAgent] = useState({});
  const [loading, setLoading] = useState(true);
  const [visiblePickupCount, setVisiblePickupCount] =
    useState(PICKUP_BATCH_SIZE);
  const loadMoreRef = useRef(null);

  const getStatusClasses = (status) => {
    if (status === "pending") {
      return isDarkMode
        ? "bg-yellow-900 text-yellow-200"
        : "bg-yellow-100 text-yellow-700";
    }

    if (status === "assigned") {
      return isDarkMode
        ? "bg-blue-900 text-blue-200"
        : "bg-blue-100 text-blue-700";
    }

    if (status === "in-progress") {
      return isDarkMode
        ? "bg-purple-900 text-purple-200"
        : "bg-purple-100 text-purple-700";
    }

    return isDarkMode
      ? "bg-green-900 text-green-200"
      : "bg-green-100 text-green-700";
  };

  /* ================= FETCH PICKUPS ================= */

  const fetchPickups = async () => {
    try {
      const res = await fetch(`${API}/api/pickups/ngo`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();

      if (res.ok) setPickups(data);
    } catch (err) {
      devError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  useEffect(() => {
    setVisiblePickupCount(PICKUP_BATCH_SIZE);
  }, [pickups.length]);

  const visiblePickups = pickups.slice(0, visiblePickupCount);
  const hasMorePickups = visiblePickupCount < pickups.length;

  useEffect(() => {
    const node = loadMoreRef.current;
    if (!node || !hasMorePickups) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisiblePickupCount((prev) =>
            Math.min(prev + PICKUP_BATCH_SIZE, pickups.length),
          );
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMorePickups, pickups.length]);

  /* ================= ASSIGN AGENT ================= */

  const assignAgent = async (pickupId) => {
    const agentId = selectedAgent[pickupId];

    if (!agentId) {
      showWarning("Select an agent first");
      return;
    }

    const agent = agents.find((a) => a._id === agentId);

    const res = await fetch(`${API}/api/pickups/assign/${pickupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationToken,
      },
      body: JSON.stringify({
        agentName: agent.name,
      }),
    });

    if (res.ok) {
      showSuccess("Agent assigned successfully");
      fetchPickups();
      return;
    }

    showError("Failed to assign agent");
  };

  /* ================= UPDATE STATUS ================= */

  const updateStatus = async (pickupId, status) => {
    const res = await fetch(`${API}/api/pickups/status/${pickupId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationToken,
      },
      body: JSON.stringify({ status }),
    });

    if (res.ok) {
      showSuccess("Pickup status updated");
      fetchPickups();
      return;
    }

    showError("Failed to update pickup status");
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex items-start sm:items-center justify-between gap-3">
        <div>
          <h1
            className={`text-2xl sm:text-3xl font-bold ${isDarkMode ? "text-white" : "text-gray-900"}`}
          >
            Pickup Management
          </h1>
          <p
            className={`mt-1 text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
          >
            Assign agents and track pickup progress efficiently.
          </p>
        </div>

        <span
          className={`shrink-0 px-3 py-1 rounded-full text-xs font-semibold ${
            isDarkMode
              ? "bg-gray-700 text-gray-200"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          {pickups.length} requests
        </span>
      </div>

      {pickups.length === 0 ? (
        <div
          className={`text-center py-10 border border-dashed rounded-xl ${
            isDarkMode
              ? "text-gray-400 border-gray-700 bg-gray-800"
              : "text-gray-400 border-gray-300 bg-white"
          }`}
        >
          No pickup requests
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {visiblePickups.map((pickup) => {
            const dateObj = new Date(pickup.scheduled_time);

            return (
              <div
                key={pickup._id}
                className={`p-4 sm:p-5 rounded-xl border transition duration-300 ${
                  isDarkMode
                    ? "bg-gray-800 border-gray-700"
                    : "bg-white border-gray-200"
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="min-w-0 space-y-1.5">
                    <div className="flex items-center justify-between gap-3">
                      <p
                        className={`font-semibold ${
                          isDarkMode ? "text-white" : "text-gray-800"
                        }`}
                      >
                        {pickup.category} Waste Pickup
                      </p>

                      <span
                        className={`shrink-0 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClasses(
                          pickup.status,
                        )}`}
                      >
                        {pickup.status}
                      </span>
                    </div>

                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      {dateObj.toLocaleDateString()} |{" "}
                      {dateObj.toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>

                    <p
                      className={`text-sm ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Volunteer: {pickup.user_id?.name || "N/A"}
                    </p>

                    <p
                      className={`text-sm wrap-break-word ${
                        isDarkMode ? "text-gray-400" : "text-gray-500"
                      }`}
                    >
                      Location: {pickup.location || "N/A"}
                    </p>
                  </div>

                  <div className="w-full lg:w-auto space-y-2">
                    {pickup.status === "pending" && (
                      <>
                        <select
                          value={selectedAgent[pickup._id] || ""}
                          onChange={(e) =>
                            setSelectedAgent((prev) => ({
                              ...prev,
                              [pickup._id]: e.target.value,
                            }))
                          }
                          className={`w-full min-w-55 px-3 py-2 rounded border transition ${
                            isDarkMode
                              ? "bg-gray-700 border-gray-600 text-white"
                              : "bg-white border-gray-300 text-gray-900"
                          }`}
                        >
                          <option value="">Select Agent</option>

                          {agents.map((agent) => (
                            <option key={agent._id} value={agent._id}>
                              {agent.name} ({agent.vehicle})
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() => assignAgent(pickup._id)}
                          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                        >
                          Assign Agent
                        </button>
                      </>
                    )}

                    {pickup.status === "assigned" && (
                      <button
                        onClick={() => updateStatus(pickup._id, "in-progress")}
                        className="w-full bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-yellow-600 transition"
                      >
                        Start Pickup
                      </button>
                    )}

                    {pickup.status === "in-progress" && (
                      <button
                        onClick={() => updateStatus(pickup._id, "completed")}
                        className="w-full bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {hasMorePickups && (
            <div ref={loadMoreRef} className="py-3 text-center">
              <span
                className={`text-sm ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}
              >
                Loading more pickup requests...
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PickupManagement;
