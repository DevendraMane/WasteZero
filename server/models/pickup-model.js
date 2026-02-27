import mongoose from "mongoose";

const pickupSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    scheduled_time: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },

    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Pickup", pickupSchema);
