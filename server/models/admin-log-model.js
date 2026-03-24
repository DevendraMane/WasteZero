import mongoose from "mongoose";

const AdminLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        "delete_opportunity",
        "dismiss_report",
        "delete_report",
        "update_user",
        "delete_user",
        "view_analytics",
        "update_settings",
        "other",
      ],
      required: true,
    },
    target_id: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      description:
        "ID of the resource being acted upon (opportunity, report, user, etc.)",
    },
    targetType: {
      type: String,
      enum: ["opportunity", "report", "user", "settings", "other"],
      required: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    adminName: {
      type: String,
      required: true,
    },
    adminEmail: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
    },
    ipAddress: {
      type: String,
      required: false,
    },
    userAgent: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    errorMessage: {
      type: String,
      required: false,
    },
  },
  { timestamps: true },
);

// Index for faster queries
AdminLogSchema.index({ admin_id: 1, createdAt: -1 });
AdminLogSchema.index({ action: 1, createdAt: -1 });
AdminLogSchema.index({ target_id: 1 });

const AdminLog = mongoose.model("AdminLog", AdminLogSchema);

export default AdminLog;
