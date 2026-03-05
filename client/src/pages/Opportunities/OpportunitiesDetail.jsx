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
  const [applying, setApplying] = useState(false);

  /* ================= FETCH OPPORTUNITY ================= */

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

  /* ================= FETCH APPLICATION STATUS ================= */

  const fetchApplicationStatus = async () => {
    if (user?.role !== "volunteer") return;

    try {
      const res = await axios.get(`${API}/api/applications/check/${id}`, {
        headers: { Authorization: authorizationToken },
      });

      if (res.data.applied) {
        setApplicationStatus(res.data.status);
      } else {
        setApplicationStatus(null);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOpportunity();
    fetchApplicationStatus();
  }, []);

  /* ================= APPLY ================= */

  const handleApply = async () => {
    try {
      setApplying(true);

      await axios.post(
        `${API}/api/applications/${id}`,
        {},
        { headers: { Authorization: authorizationToken } },
      );

      setApplicationStatus("pending");
    } catch (error) {
      alert(error.response?.data?.message || "Already applied");
    } finally {
      setApplying(false);
    }
  };

  /* ================= DELETE ================= */

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

  const isClosed = new Date(opportunity.date) < new Date();

  const formattedDate = opportunity.date
    ? new Date(opportunity.date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not specified";

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
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-gray-800">
            {opportunity.title}
          </h1>

          {isClosed ? (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
              Closed
            </span>
          ) : (
            <span className="bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
              Open
            </span>
          )}
        </div>

        <p className="text-gray-500 mt-1">Volunteer opportunity details</p>
      </div>

      {/* MAIN GRID */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT */}

        <div className="lg:col-span-2 space-y-6">
          {/* IMAGE */}

          <div className="rounded-2xl overflow-hidden shadow-md">
            <img
              src={
                opportunity.image
                  ? opportunity.image
                  : "https://via.placeholder.com/800x400?text=Opportunity"
              }
              alt={opportunity.title}
              className="w-full h-80 object-cover"
            />
          </div>

          {/* DESCRIPTION */}

          <div className="bg-white p-6 rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-3">Description</h2>
            <p className="text-gray-600">{opportunity.description}</p>
          </div>

          {/* SKILLS */}

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

        {/* RIGHT */}

        <div className="bg-white p-6 rounded-2xl shadow-md space-y-6 h-fit">
          <h2 className="text-xl font-semibold">Opportunity Details</h2>

          <div className="space-y-3 text-gray-600">
            <p>📅 Date: {formattedDate}</p>
            <p>⏱ Duration: {opportunity.duration}</p>
            <p>📍 Location: {opportunity.location}</p>
            <p>👤 Posted by: {opportunity.ngo_id?.name || "NGO"}</p>
          </div>

          {/* NGO ACTIONS */}

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

          {/* VOLUNTEER APPLY */}

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
              ) : isClosed ? (
                <button
                  disabled
                  className="w-full bg-gray-200 text-gray-500 py-2 rounded-lg cursor-not-allowed"
                >
                  Opportunity Closed
                </button>
              ) : (
                <button
                  onClick={handleApply}
                  disabled={applying}
                  className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
                >
                  {applying ? "Applying..." : "Apply Now"}
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
