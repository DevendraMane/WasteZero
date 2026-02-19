import React, { useState } from "react";
import axios from "axios";
import "../../styles/CreateOpportunity.css";

const CreateOpportunity = ({ onClose, onCreated }) => {
  const token = localStorage.getItem("token");

  const [form, setForm] = useState({
    title: "",
    description: "",
    duration: "",
    location: "",
    required_skills: "",
  });

  const [image, setImage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async () => {
    const formData = new FormData();

    Object.keys(form).forEach((key) => formData.append(key, form[key]));

    if (image) formData.append("image", image);

    await axios.post("http://localhost:5000/api/opportunities", formData, {
      headers: { Authorization: token },
    });

    onCreated();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>Create Opportunity</h2>

        <input name="title" placeholder="Title" onChange={handleChange} />

        <textarea
          name="description"
          placeholder="Description"
          onChange={handleChange}
        />

        <input
          name="required_skills"
          placeholder="Skills (comma separated)"
          onChange={handleChange}
        />

        <input name="duration" placeholder="Duration" onChange={handleChange} />

        <input name="location" placeholder="Location" onChange={handleChange} />

        {/* IMAGE UPLOAD BOX */}
        <label className="upload-box">
          <input type="file" onChange={handleImage} hidden />

          {image ? image.name : "Click or Drag Image Here"}
        </label>

        <div className="modal-buttons">
          <button className="create-btn" onClick={handleSubmit}>
            Create
          </button>

          <button className="cancel-btn" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOpportunity;
