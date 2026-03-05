import Opportunity from "../models/opportunity-model.js";
import cloudinary from "../config/cloudinary.js";
import streamifier from "streamifier";

/* ================= CREATE OPPORTUNITY ================= */

const createOpportunity = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      location,
      latitude,
      longitude,
      required_skills,
      date,
    } = req.body;

    let imageUrl = "";
    let imagePublicId = "";

    if (req.file) {
      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "wastezero_opportunities" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();

      imageUrl = result.secure_url;
      imagePublicId = result.public_id;
    }

    const opportunity = new Opportunity({
      ngo_id: req.user.userId,
      title,
      description,
      duration,
      location,
      latitude,
      longitude,
      date,
      required_skills: required_skills ? required_skills.split(",") : [],
      image: imageUrl,
      imagePublicId,
    });

    await opportunity.save();

    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET ALL ================= */

const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find()
      .populate("ngo_id", "name")
      .sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET SINGLE ================= */

const getSingleOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id).populate(
      "ngo_id",
      "name",
    );

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    res.status(200).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= DELETE ================= */

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (opportunity.ngo_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    /* DELETE IMAGE FROM CLOUDINARY */

    if (opportunity.imagePublicId) {
      await cloudinary.uploader.destroy(opportunity.imagePublicId);
    }

    await opportunity.deleteOne();

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE ================= */

const updateOpportunity = async (req, res) => {
  try {
    const { title, description, duration, location, required_skills, date } =
      req.body;

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    if (opportunity.ngo_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to edit" });
    }

    opportunity.title = title || opportunity.title;
    opportunity.description = description || opportunity.description;
    opportunity.duration = duration || opportunity.duration;
    opportunity.location = location || opportunity.location;
    opportunity.date = date || opportunity.date;

    if (required_skills) {
      opportunity.required_skills = required_skills.split(",");
    }

    /* IMAGE UPDATE */

    if (req.file) {
      /* DELETE OLD IMAGE */

      if (opportunity.imagePublicId) {
        await cloudinary.uploader.destroy(opportunity.imagePublicId);
      }

      const streamUpload = () =>
        new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "wastezero_opportunities" },
            (error, result) => {
              if (result) resolve(result);
              else reject(error);
            },
          );

          streamifier.createReadStream(req.file.buffer).pipe(stream);
        });

      const result = await streamUpload();

      opportunity.image = result.secure_url;
      opportunity.imagePublicId = result.public_id;
    }

    await opportunity.save();

    res.status(200).json({
      message: "Opportunity updated successfully",
      opportunity,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= NGO OPPORTUNITIES ================= */

const getOpportunitiesForNGO = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Access denied" });
    }

    const opportunities = await Opportunity.find({ ngo_id: req.user.userId })
      .populate("ngo_id", "name")
      .sort({ createdAt: -1 });

    res.status(200).json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  getAllOpportunities,
  createOpportunity,
  getSingleOpportunity,
  deleteOpportunity,
  updateOpportunity,
  getOpportunitiesForNGO,
};
