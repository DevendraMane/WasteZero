import React, { useState } from "react";

const Schedule = () => {
  const [showForm, setShowForm] = useState(false);

  const [formData, setFormData] = useState({
    date: "",
    time: "",
    location: "",
    wasteType: "",
  });

  const [pickups, setPickups] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreatePickup = () => {
    if (!formData.date || !formData.time || !formData.location) {
      alert("Please fill all required fields");
      return;
    }

    setPickups((prev) => [...prev, formData]);

    setFormData({
      date: "",
      time: "",
      location: "",
      wasteType: "",
    });

    setShowForm(false);
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Schedule Pickup</h1>

        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          {showForm ? "Close" : "Create Pickup"}
        </button>
      </div>

      {/* CREATE FORM */}
      {showForm && (
        <div className="bg-white p-8 rounded-2xl shadow-md grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Time</label>
            <input
              type="time"
              name="time"
              value={formData.time}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <input
              type="text"
              name="location"
              placeholder="Enter pickup location"
              value={formData.location}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Waste Type</label>
            <select
              name="wasteType"
              value={formData.wasteType}
              onChange={handleChange}
              className="w-full border rounded-lg px-4 py-2"
            >
              <option value="">Select Type</option>
              <option value="Plastic">Plastic</option>
              <option value="E-Waste">E-Waste</option>
              <option value="Organic">Organic</option>
              <option value="Metal">Metal</option>
            </select>
          </div>

          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={handleCreatePickup}
              className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
            >
              Schedule
            </button>
          </div>
        </div>
      )}

      {/* PICKUP LIST */}
      <div className="bg-white p-8 rounded-2xl shadow-md">
        <h2 className="text-xl font-semibold mb-6">Upcoming Pickups</h2>

        {pickups.length === 0 ? (
          <div className="text-gray-400 text-center py-10 border border-dashed rounded-lg">
            No pickups scheduled
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-3">Date</th>
                <th className="py-3">Time</th>
                <th className="py-3">Location</th>
                <th className="py-3">Waste Type</th>
              </tr>
            </thead>
            <tbody>
              {pickups.map((pickup, index) => (
                <tr key={index} className="border-b">
                  <td className="py-3">{pickup.date}</td>
                  <td className="py-3">{pickup.time}</td>
                  <td className="py-3">{pickup.location}</td>
                  <td className="py-3">{pickup.wasteType}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Schedule;
