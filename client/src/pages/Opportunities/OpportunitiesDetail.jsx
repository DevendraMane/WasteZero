import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../store/AuthContext";

const OpportunitiesDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { API, authorizationToken, user } = useAuth();

  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applicationStatus, setApplicationStatus] = useState(null);
  const fetchOpportunity = async () => {
    try {
      const res = await axios.get(`${API}/api/opportunities/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      setOpportunity(res.data);
    } catch (error) {
      console.error("Error fetching opportunity:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunity();
  }, []);

  useEffect(() => {
    fetchOpportunity();

    const fetchApplicationStatus = async () => {
      if (user?.role !== "volunteer") return;

      try {
        const res = await axios.get(`${API}/api/applications/check/${id}`, {
          headers: { Authorization: authorizationToken },
        });

        if (res.data.applied) {
          setApplicationStatus(res.data.status); // pending / accepted / rejected
        } else {
          setApplicationStatus(null);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchApplicationStatus();
  }, []);

  const handleApply = async () => {
    try {
      await axios.post(
        `${API}/api/applications/${id}`,
        {},
        { headers: { Authorization: authorizationToken } },
      );

      setApplicationStatus("pending");
    } catch (error) {
      alert(error.response?.data?.message || "Already applied");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this opportunity?"))
      return;

    try {
      await axios.delete(`${API}/api/opportunities/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      navigate("/opportunities");
    } catch (error) {
      alert("Delete failed");
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading...</div>;
  }

  if (!opportunity) {
    return <div className="text-center py-20">Opportunity not found</div>;
  }

  return (
    <div className="space-y-8">
      {/* BACK BUTTON */}
      <button
        onClick={() => navigate("/opportunities")}
        className="text-gray-500 hover:text-green-600 transition"
      >
        ← Back to Opportunities
      </button>

      {/* TITLE */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">
          {opportunity.title}
        </h1>
        <p className="text-gray-500 mt-1">Volunteer opportunity details</p>
      </div>

      {/* MAIN GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">
          {/* IMAGE */}
          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={`${API}/uploads/${opportunity.image}`}
              alt={opportunity.title}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* DESCRIPTION */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-600">{opportunity.description}</p>
          </div>

          {/* REQUIRED SKILLS */}
          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-3">Required Skills</h2>

            <div className="flex flex-wrap gap-2">
              {opportunity.required_skills?.map((skill, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6 h-fit">
          <h2 className="text-xl font-semibold">Opportunity Details</h2>

          <div className="space-y-3 text-gray-600">
            <p>📅 Date: {opportunity.date || "Not specified"}</p>
            <p>⏱ Duration: {opportunity.duration}</p>
            <p>📍 Location: {opportunity.location}</p>
            <p>👤 Posted by: {opportunity.postedBy?.name || "NGO"}</p>
          </div>

          {/* ACTION BUTTONS */}
          {/* ACTION BUTTONS */}

          {/* NGO Buttons */}
          {user?.role === "ngo" && (
            <div className="flex gap-3 pt-4">
              <button
                onClick={() => navigate(`/opportunities/edit/${id}`)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 py-2 rounded-lg transition"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                className="flex-1 bg-red-500 text-white hover:bg-red-600 py-2 rounded-lg transition"
              >
                Delete
              </button>
            </div>
          )}

          {/* Volunteer Application Section */}
          {user?.role === "volunteer" && (
            <div className="pt-4">
              {applicationStatus === "accepted" ? (
                <button
                  disabled
                  className="w-full bg-green-600 text-white py-2 rounded-lg"
                >
                  Accepted
                </button>
              ) : applicationStatus === "pending" ? (
                <button
                  disabled
                  className="w-full bg-yellow-100 text-yellow-700 py-2 rounded-lg"
                >
                  Applied (Pending)
                </button>
              ) : applicationStatus === "rejected" ? (
                <button
                  disabled
                  className="w-full bg-red-100 text-red-600 py-2 rounded-lg"
                >
                  Rejected
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  Apply Now
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OpportunitiesDetail;
