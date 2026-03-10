import React, { useEffect, useState } from "react";
import { useAuth } from "../../store/AuthContext";

const PickupManagement = () => {
  const { API, authorizationToken } = useAuth();

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

  /* ================= FETCH PICKUPS ================= */

  const fetchPickups = async () => {
    try {
      const res = await fetch(`${API}/api/pickups/ngo`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();

      if (res.ok) setPickups(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  /* ================= ASSIGN AGENT ================= */

  const assignAgent = async (pickupId) => {
    const agentId = selectedAgent[pickupId];

    if (!agentId) {
      alert("Select an agent first");
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

    if (res.ok) fetchPickups();
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

    if (res.ok) fetchPickups();
  };

  if (loading) return <div>Loading pickups...</div>;

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Pickup Management</h1>

      {pickups.length === 0 ? (
        <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
          No pickup requests
        </div>
      ) : (
        <div className="space-y-4">
          {pickups.map((pickup) => {
            const dateObj = new Date(pickup.scheduled_time);

            return (
              <div
                key={pickup._id}
                className="bg-white p-6 rounded-xl shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    {pickup.category} Waste Pickup
                  </p>

                  <p className="text-sm text-gray-500">
                    📅 {dateObj.toLocaleDateString()} | ⏱{" "}
                    {dateObj.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>

                  <p className="text-sm text-gray-500">
                    Volunteer: {pickup.user_id?.name}
                  </p>

                  <p className="text-sm text-gray-500">
                    Location: {pickup.location || "N/A"}
                  </p>
                </div>

                <div className="space-y-2">
                  {/* ASSIGN AGENT */}

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
                        className="border px-3 py-1 rounded"
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
                        className="bg-blue-600 text-white px-4 py-1 rounded"
                      >
                        Assign
                      </button>
                    </>
                  )}

                  {/* STATUS CONTROLS */}

                  {pickup.status === "assigned" && (
                    <button
                      onClick={() => updateStatus(pickup._id, "in-progress")}
                      className="bg-yellow-500 text-white px-4 py-1 rounded"
                    >
                      Start Pickup
                    </button>
                  )}

                  {pickup.status === "in-progress" && (
                    <button
                      onClick={() => updateStatus(pickup._id, "completed")}
                      className="bg-green-600 text-white px-4 py-1 rounded"
                    >
                      Mark Completed
                    </button>
                  )}

                  <span className="text-sm text-gray-500">
                    Status: {pickup.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PickupManagement;
