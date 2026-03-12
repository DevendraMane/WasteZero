import Settings from "../models/settings-model.js";

/*
---------------------------------------
GET PLATFORM SETTINGS
---------------------------------------
*/
const getSettings = async (req, res) => {
  try {
    const settings = await Settings.getInstance();
    res.status(200).json(settings);
  } catch (error) {
    console.error("Get settings error:", error);
    res.status(500).json({ message: error.message });
  }
};

/*
---------------------------------------
UPDATE PLATFORM SETTINGS (Admin Only)
---------------------------------------
*/
const updateSettings = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const settings = await Settings.getInstance();

    // Update allowed fields
    const allowedFields = [
      "allowRegistrations",
      "allowPickups",
      "allowOpportunities",
      "enableMessageMonitoring",
      "autoFlagThreshold",
      "platformName",
      "supportEmail",
      "maintenanceMode",
      "maintenanceMessage",
    ];

    const updates = {};
    allowedFields.forEach((field) => {
      if (req.body.hasOwnProperty(field)) {
        updates[field] = req.body[field];
      }
    });

    // Track who made the change
    updates.lastUpdatedBy = req.user._id;

    // Apply updates
    Object.assign(settings, updates);
    await settings.save();

    res.status(200).json({
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ message: error.message });
  }
};

export default {
  getSettings,
  updateSettings,
};
