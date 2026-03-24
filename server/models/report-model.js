import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    opportunity_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Opportunity",
      required: true,
    },

    reported_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    reason: {
      type: String,
      required: true,
      enum: [
        "inappropriate-content",
        "fake-opportunity",
        "spam",
        "dangerous-activity",
        "misleading-information",
        "other",
      ],
    },

    description: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "dismissed"],
      default: "pending",
    },

    reviewed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    reviewed_at: {
      type: Date,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Report", reportSchema);
