import Pickup from "../models/pickup-model.js";
import User from "../models/user-model.js";
import Notification from "../models/notification-model.js";
import { io } from "../server.js";
import { sendPickupNotificationEmail } from "../utils/sendEmail.js";
import logger from "../utils/logger.js";
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
    const volunteer = await User.findById(req.user.userId).select(
      "name phone email notifications",
    );

    /* GET ALL NGOs */
    const ngos = await User.find({ role: "ngo" }).select(
      "_id name email notifications",
    );

    // Batch create all notifications at once instead of one-by-one
    const notificationDocs = ngos.map((ngo) => ({
      userId: ngo._id,
      type: "pickup",
      message: `New pickup request from ${volunteer.name}`,
      link: "/ngo/pickups",
      sender: {
        name: volunteer.name,
      },
    }));

    const createdNotifications =
      notificationDocs.length > 0
        ? await Notification.insertMany(notificationDocs)
        : [];

    // Emit socket notifications in parallel
    const socketPromises = createdNotifications.map((notification, index) => {
      io.to(ngos[index]._id.toString()).emit("new_notification", notification);
      return Promise.resolve();
    });

    await Promise.all(socketPromises);

    // Send emails asynchronously WITHOUT awaiting (fire-and-forget)
    // This prevents email sending from blocking the response
    ngos.forEach((ngo) => {
      if (ngo.notifications?.email) {
        sendPickupNotificationEmail(ngo.email, {
          location,
          itemType: category,
          quantity: "1",
          scheduledDate: scheduled_time,
          volunteerName: volunteer.name,
          volunteerPhone: volunteer.phone || "N/A",
        }).catch((emailError) => {
          logger.error(
            `[PICKUP EMAIL ERROR] Failed to send email to ${ngo.email}:`,
            emailError.message,
          );
        });
      }
    });

    const populatedPickup = await Pickup.findById(pickup._id).populate(
      "user_id",
      "name location",
    );

    res.status(201).json(populatedPickup);
  } catch (error) {
    logger.error("Create pickup error:", error);
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

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 6;
    const status = req.query.status;

    const skip = (page - 1) * limit;

    // Build query filter
    const query = {};
    if (status && status !== "all") {
      query.status = status;
    }

    const total = await Pickup.countDocuments(query);
    const pickups = await Pickup.find(query)
      .populate("user_id", "name location")
      .populate("agent_id", "name phone vehicle")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      data: pickups,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    });
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
