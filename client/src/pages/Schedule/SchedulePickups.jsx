import React, { useState, useEffect } from "react";
import { useAuth } from "../../store/AuthContext";

const SchedulePickups = () => {
  const { API, authorizationToken } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [pickups, setPickups] = useState([]);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    category: "",
  });

  /* ================= FETCH PICKUPS ================= */
  useEffect(() => {
    const fetchPickups = async () => {
      const res = await fetch(`${API}/api/pickups/volunteer`, {
        headers: { Authorization: authorizationToken },
      });

      const data = await res.json();
      if (res.ok) setPickups(data);
    };

    fetchPickups();
  }, [API, authorizationToken]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePickup = async () => {
    if (!formData.date || !formData.time || !formData.category) {
      alert("Please fill all fields");
      return;
    }

    const scheduled_time = new Date(`${formData.date}T${formData.time}`);

    const res = await fetch(`${API}/api/pickups`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authorizationToken,
      },
      body: JSON.stringify({
        category: formData.category,
        scheduled_time,
      }),
    });

    if (res.ok) {
      const newPickup = await res.json();
      setPickups((prev) => [...prev, newPickup]);
      setShowForm(false);
      setFormData({ date: "", time: "", category: "" });
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedule Pickup</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg"
        >
          {showForm ? "Close" : "Create Pickup"}
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-md grid md:grid-cols-2 gap-6">
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />
          <input
            type="time"
            name="time"
            value={formData.time}
            onChange={handleChange}
            className="border px-4 py-2 rounded"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="border px-4 py-2 rounded md:col-span-2"
          >
            <option value="">Select Waste Type</option>
            <option value="Plastic">Plastic</option>
            <option value="E-Waste">E-Waste</option>
            <option value="Organic">Organic</option>
            <option value="Metal">Metal</option>
          </select>

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleCreatePickup}
              className="bg-green-600 text-white px-6 py-2 rounded-lg"
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Upcoming Pickups</h2>

        {pickups.length === 0 ? (
          <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
            No pickups scheduled
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b text-gray-500 text-sm uppercase tracking-wider">
                  <th className="py-3">Date</th>
                  <th className="py-3">Time</th>
                  <th className="py-3">Category</th>
                  <th className="py-3 text-right">Status</th>
                </tr>
              </thead>

              <tbody>
                {pickups.map((pickup) => {
                  const dateObj = new Date(pickup.scheduled_time);

                  const isPast = dateObj < new Date();

                  return (
                    <tr
                      key={pickup._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="py-4 font-medium text-gray-800">
                        {dateObj.toLocaleDateString()}
                      </td>

                      <td className="py-4 text-gray-600">
                        {dateObj.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      <td className="py-4 text-gray-700">{pickup.category}</td>

                      <td className="py-4 text-right">
                        {isPast ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-gray-200 text-gray-600">
                            Completed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700">
                            {pickup.status}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchedulePickups;
