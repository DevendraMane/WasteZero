import Pickup from "../models/pickup-model.js";

/* ================= CREATE PICKUP ================= */
const createPickup = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res
        .status(403)
        .json({ message: "Only volunteers can schedule pickups" });
    }

    const { category, scheduled_time } = req.body;

    const pickup = new Pickup({
      user_id: req.user.userId,
      category,
      scheduled_time,
    });

    await pickup.save();

    res.status(201).json(pickup);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= GET VOLUNTEER PICKUPS ================= */
const getVolunteerPickups = async (req, res) => {
  try {
    if (req.user.role !== "volunteer") {
      return res.status(403).json({ message: "Access denied" });
    }

    const pickups = await Pickup.find({
      user_id: req.user.userId,
    }).sort({ scheduled_time: 1 });

    res.status(200).json(pickups);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export default {
  createPickup,
  getVolunteerPickups,
};
