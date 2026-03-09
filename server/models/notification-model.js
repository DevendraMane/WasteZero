// models/notification-model.js

import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    type: {
      type: String,
      enum: ["opportunity", "pickup", "message"],
    },

    message: String,

    link: String,

    read: {
      type: Boolean,
      default: false,
    },

    sender: {
      name: String,
      image: String,
    },
  },
  { timestamps: true },
);

export default mongoose.model("Notification", notificationSchema);
