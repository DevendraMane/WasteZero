import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";

const Opportunities = () => {
  const token = localStorage.getItem("token");

  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchOpportunities = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/opportunities", {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOpportunities(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

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

        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
        >
          + Create Opportunity
        </button>
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
                  src={`http://localhost:5000/uploads/${item.image}`}
                  alt={item.title}
                  className="w-full h-full object-cover hover:scale-105 transition duration-500"
                />
              </div>

              {/* CONTENT */}
              <div className="p-6 space-y-4">
                {/* TITLE + STATUS */}
                <div className="flex justify-between items-start">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {item.title}
                  </h3>

                  <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                    Open
                  </span>
                </div>

                {/* DESCRIPTION */}
                <p className="text-gray-500 text-sm line-clamp-3">
                  {item.description}
                </p>

                {/* INFO */}
                <div className="flex justify-between text-sm text-gray-500">
                  <span>📍 {item.location}</span>
                  <span>⏱ {item.duration}</span>
                </div>

                {/* BUTTON */}
                <button className="w-full bg-gray-100 hover:bg-green-100 text-gray-700 font-medium py-2 rounded-lg transition">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Opportunities;
