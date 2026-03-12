import mongoose from "mongoose";

const userFlagSchema = new mongoose.Schema(
  {
    // The user being flagged/reported
    reportedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // The NGO admin doing the flagging
    reportedByNgoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Reason for flag
    reason: {
      type: String,
      enum: [
        "abusive_language",
        "inappropriate_behavior",
        "spam",
        "fraud",
        "other",
      ],
      default: "other",
    },

    // Description of the issue
    description: {
      type: String,
      trim: true,
    },

    // Flag status
    status: {
      type: String,
      enum: ["active", "resolved", "dismissed"],
      default: "active",
    },

    // Admin notes
    adminNotes: {
      type: String,
      trim: true,
    },

    // Action taken (if any)
    actionTaken: {
      type: String,
      enum: ["none", "warned", "suspended", "banned"],
      default: "none",
    },
  },
  { timestamps: true },
);

// Index to prevent duplicate flags from same NGO to same user
userFlagSchema.index({ reportedUserId: 1, reportedByNgoId: 1 });

const UserFlag = mongoose.model("UserFlag", userFlagSchema);

export default UserFlag;
