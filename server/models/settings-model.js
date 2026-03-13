import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
  {
    // Feature Toggles
    allowRegistrations: {
      type: Boolean,
      default: true,
    },
    allowPickups: {
      type: Boolean,
      default: true,
    },
    allowOpportunities: {
      type: Boolean,
      default: true,
    },

    // System Configuration
    platformName: {
      type: String,
      default: "WasteZero",
    },
    supportEmail: {
      type: String,
      default: "support@wastezero.com",
    },

    // Maintenance
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    maintenanceMessage: {
      type: String,
      default:
        "The platform is undergoing maintenance. Please try again later.",
    },

    // Admin tracking
    lastUpdatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Ensure only one document exists
settingsSchema.statics.getInstance = async function () {
  let settings = await this.findOne({});
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

const Settings = mongoose.model("Settings", settingsSchema);

export default Settings;
