import Pickup from "../models/pickup-model.js";
import User from "../models/user-model.js";
import Notification from "../models/notification-model.js";
import { io } from "../server.js";
/* ================= CREATE PICKUP ================= */

const createPickup = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Only volunteers can schedule pickups" });
    }

    const { category, scheduled_time, location, latitude, longitude } =
      req.body;

    const pickup = new Pickup({
      user_id: req.user.userId,
      category,
      scheduled_time,
      location,
      latitude,
      longitude,
      status: "pending",
    });

    await pickup.save();

    /* GET VOLUNTEER INFO */
    const volunteer = await User.findById(req.user.userId).select("name");

    /* GET ALL NGOs */
    const ngos = await User.find({ role: "ngo" }).select("_id");

    /* SEND NOTIFICATIONS */
    for (let ngo of ngos) {
      const notification = await Notification.create({
        userId: ngo._id,
        type: "pickup",
        message: `New pickup request from ${volunteer.name}`,
        link: "/ngo/pickups",
        sender: {
          name: volunteer.name,
        },
      });

      io.to(ngo._id.toString()).emit("new_notification", notification);
    }

    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "user_id",
      "name location",
    );

    res.status(201).json(populatedPickup);
  } catch (error) {
    console.error("Create pickup error:", error);
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET VOLUNTEER PICKUPS ================= */

const getVolunteerPickups = async (req, res) => {
  try {
    const pickups = await Pickup.find({
      user_id: req.user.userId,
    })
      .populate("agent_id", "name phone vehicle")
      .sort({ scheduled_time: 1 });

    res.status(200).json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET NGO PICKUPS ================= */

const getNGOPickups = async (req, res) => {
  try {
    if (req.user.role !== "ngo") {
      return res.status(403).json({ message: "Access denied" });
    }

    const pickups = await Pickup.find()
      .populate("user_id", "name location")
      .populate("agent_id", "name phone vehicle")
      .sort({ createdAt: -1 });

    res.status(200).json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= ASSIGN AGENT ================= */

const assignAgent = async (req, res) => {
  try {
    const { agentId, agentName } = req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    pickup.agent_name = agentName;
    pickup.status = "assigned";

    await pickup.save();
    // Notify volunteer

    const volunteer = await User.findById(pickup.user_id);

    const notification = await Notification.create({
      userId: volunteer._id,
      type: "pickup",
      message: `Your pickup has been assigned to ${agentName}`,
      link: "/volunteer/pickups",
      sender: {
        name: agentName,
      },
    });

    io.to(volunteer._id.toString()).emit("new_notification", notification);
    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= UPDATE STATUS ================= */

const updatePickupStatus = async (req, res) => {
  try {
    const { status } = req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    pickup.status = status;

    await pickup.save();
    if (status === "completed") {
      const volunteer = await User.findById(pickup.user_id);

      const notification = await Notification.create({
        userId: volunteer._id,
        type: "pickup",
        message: `Your pickup has been successfully completed`,
        link: "/volunteer/pickups",
      });

      io.to(volunteer._id.toString()).emit("new_notification", notification);
    }
    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updatePickup = async (req, res) => {
  try {
    const { category, scheduled_time, location, latitude, longitude } =
      req.body;

    const pickup = await Pickup.findById(req.params.id);

    if (!pickup) {
      return res.status(404).json({ message: "Pickup not found" });
    }

    if (pickup.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Cannot edit pickup after assignment" });
    }

    pickup.category = category;
    pickup.scheduled_time = scheduled_time;
    pickup.location = location;
    pickup.latitude = latitude;
    pickup.longitude = longitude;

    await pickup.save();

    res.json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createPickup,
  getVolunteerPickups,
  getNGOPickups,
  assignAgent,
  updatePickupStatus,
  updatePickup,
};
