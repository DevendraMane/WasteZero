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
      enum: ["pending", "assigned", "in-progress", "completed"],
      default: "pending",
    },

    agent_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    agent_name: {
      type: String,
      default: null,
    },
    location: {
      type: String,
    },

    latitude: Number,
    longitude: Number,
  },
  { timestamps: true },
);

export default mongoose.model("Pickup", pickupSchema);
