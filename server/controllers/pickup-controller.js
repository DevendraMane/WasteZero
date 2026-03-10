import Pickup from "../models/pickup-model.js";
import User from "../models/user-model.js";

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

    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "user_id",
      "name location",
    );

    res.status(201).json(populatedPickup);
  } catch (error) {
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
