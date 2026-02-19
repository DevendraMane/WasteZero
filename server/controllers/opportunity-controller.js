import Opportunity from "../models/opportunity-model.js";

const createOpportunity = async (req, res) => {
  try {
    const { title, description, duration, location, required_skills } =
      req.body;

    const opportunity = new Opportunity({
      ngo_id: req.user.userId,
      title,
      description,
      duration,
      location,
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

export default {
  getAllOpportunities,
  createOpportunity,
};
