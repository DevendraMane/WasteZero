import Opportunity from "../models/opportunity-model.js";

const createOpportunity = async (req, res) => {
  try {
    const { title, description, duration, location, required_skills, date } =
      req.body;

    const opportunity = new Opportunity({
      ngo_id: req.user.userId,
      title,
      description,
      duration,
      location,
      date,
      required_skills: required_skills ? required_skills.split(",") : [],
      image: req.file?.filename,
    });

    await opportunity.save();

    res.status(201).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOpportunities = async (req, res) => {
  try {
    const opportunities = await Opportunity.find().sort({ createdAt: -1 });

    res.json(opportunities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSingleOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    res.status(200).json(opportunity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // 🔒 Only the NGO who created it can delete
    if (opportunity.ngo_id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Not authorized to delete" });
    }

    await opportunity.deleteOne();

    res.status(200).json({ message: "Opportunity deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOpportunity = async (req, res) => {
  try {
    const { title, description, duration, location, required_skills, date } =
      req.body;

    const opportunity = await Opportunity.findById(req.params.id);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // 🔒 Only owner NGO can edit
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

    // If new image uploaded
    if (req.file) {
      opportunity.image = req.file.filename;
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

/*
--------------------------------------
GET OPPORTUNITIES FOR NGO
--------------------------------------
*/
const getOpportunitiesForNGO = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Access denied" });
    }

    const opportunities = await Opportunity.find({
      ngo_id: req.user.userId,
    }).sort({ createdAt: -1 });

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
