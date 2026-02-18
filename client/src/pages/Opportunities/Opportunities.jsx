import React from "react";
import "./Opportunities.css";

const opportunitiesData = [
  {
    id: 1,
    title: "Beach Cleanup Drive",
    description:
      "Join us for a day of cleaning up the shoreline and protecting marine life.",
    date: "2025-06-20",
    location: "Brighton Beach, Boston",
    duration: "4 hours",
    image: "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800",
    status: "Open",
  },
  {
    id: 2,
    title: "Recycling Workshop",
    description: "Teach community members about proper recycling techniques.",
    date: "2025-06-15",
    location: "Community Center, Seattle",
    duration: "2 hours",
    image: "https://images.unsplash.com/photo-1611284446314-60a58ac0deb9?w=800",
    status: "Open",
  },
  {
    id: 3,
    title: "School Education Program",
    description:
      "Visit local schools to raise awareness about waste management.",
    date: "2025-07-10",
    location: "Various schools in Boston",
    duration: "3 hours",
    image: "https://images.unsplash.com/photo-1588072432836-e10032774350?w=800",
    status: "Open",
  },
];

const Opportunities = () => {
  return (
    <div className="opportunities-container">
      {/* Header */}
      <div className="opportunities-header">
        <div>
          <h2>Volunteer Opportunities</h2>
          <p>Browse and join recycling and waste management initiatives</p>
        </div>

        <button className="create-btn">+ Create Opportunity</button>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search opportunities..."
        className="search-input"
      />

      {/* Cards */}
      <div className="cards-container">
        {opportunitiesData.map((item) => (
          <div className="card" key={item.id}>
            <img src={item.image} alt={item.title} />

            <div className="card-content">
              <div className="card-header">
                <h3>{item.title}</h3>
                <span className="status">{item.status}</span>
              </div>

              <p className="description">{item.description}</p>

              <div className="info">
                <p>📅 {item.date}</p>
                <p>📍 {item.location}</p>
                <p>⏱ {item.duration}</p>
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
