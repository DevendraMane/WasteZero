import React, { useState, useEffect } from "react";
import axios from "axios";
import CreateOpportunity from "./CreateOpportunity";
import "./opportunities.css";

const Opportunities = () => {
  const token = localStorage.getItem("token");

  const [opportunities, setOpportunities] = useState([]);
  const [showForm, setShowForm] = useState(false);

  const fetchOpportunities = async () => {
    const res = await axios.get("http://localhost:5000/api/opportunities", {
      headers: { Authorization: token },
    });

    setOpportunities(res.data);
  };

  useEffect(() => {
    fetchOpportunities();
  }, []);

  return (
    <div className="opportunities-container">
      {/* HEADER */}
      <div className="opportunities-header">
        <div>
          <h2>Volunteer Opportunities</h2>
          <p>Browse and manage waste management initiatives</p>
        </div>

        <button className="create-btn" onClick={() => setShowForm(true)}>
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
      <div className="cards-container">
        {opportunities.map((item) => (
          <div key={item._id} className="opportunity-card">
            <img
              src={`http://localhost:5000/uploads/${item.image}`}
              alt={item.title}
            />

            <div className="opportunity-card-content">
              <div className="card-header">
                <h3>{item.title}</h3>
                <span className="status open">Open</span>
              </div>

              <p className="description">{item.description}</p>

              <div className="info">
                <span>📍 {item.location}</span>
                <span>⏱ {item.duration}</span>
              </div>

              <button className="details-btn">View Details</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Opportunities;
