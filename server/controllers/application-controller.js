import Application from "../models/application-model.js";
import Opportunity from "../models/opportunity-model.js";

/*
--------------------------------------
APPLY TO OPPORTUNITY
--------------------------------------
*/
const applyToOpportunity = async (req, res) => {
  try {
    // Only volunteer can apply
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Only volunteers can apply" });
    }

    const opportunity = await Opportunity.findById(req.params.opportunityId);

    if (!opportunity) {
      return res.status(404).json({ message: "Opportunity not found" });
    }

    // Prevent duplicate application
    const existingApplication = await Application.findOne({
      opportunity_id: req.params.opportunityId,
      volunteer_id: req.user.userId,
    });

    if (existingApplication) {
      return res.status(400).json({
        message: "You have already applied to this opportunity",
      });
    }

    const application = new Application({
      opportunity_id: req.params.opportunityId,
      volunteer_id: req.user.userId,
      status: "pending",
    });

    await application.save();

    res.status(201).json({
      message: "Application submitted successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const checkIfApplied = async (req, res) => {
  try {
    const application = await Application.findOne({
      opportunity_id: req.params.opportunityId,
      volunteer_id: req.user.userId,
    });

    if (application) {
      return res.status(200).json({
        applied: true,
        status: application.status,
      });
    }

    res.status(200).json({ applied: false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
--------------------------------------
GET APPLICATIONS FOR NGO
--------------------------------------
*/
const getApplicationsForNGO = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Access denied" });
    }

    const opportunities = await Opportunity.find({
      ngo_id: req.user.userId,
    }).select("_id");

    const opportunityIds = opportunities.map((o) => o._id);

    const applications = await Application.find({
      opportunity_id: { $in: opportunityIds },
    })
      .populate("volunteer_id", "name email skills")
      .populate("opportunity_id", "title");

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
--------------------------------------
UPDATE APPLICATION STATUS
--------------------------------------
*/
const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({ message: "Application not found" });
    }

    application.status = status;
    await application.save();

    res.status(200).json({
      message: "Status updated successfully",
      application,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/*
--------------------------------------
GET APPLICATIONS FOR VOLUNTEER
--------------------------------------
*/
const getApplicationsForVolunteer = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const applications = await Application.find({
      volunteer_id: req.user.userId,
    })
      .populate("opportunity_id", "title location duration status date")
      .sort({ createdAt: -1 });

    res.status(200).json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  applyToOpportunity,
  checkIfApplied,
  getApplicationsForNGO,
  updateApplicationStatus,
  getApplicationsForVolunteer,
};
