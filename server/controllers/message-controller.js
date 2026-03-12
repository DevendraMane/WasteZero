import Message from "../models/message-model.js";
import User from "../models/user-model.js";
import UserFlag from "../models/user-flag-model.js";
import Notification from "../models/notification-model.js";
import mongoose from "mongoose";
import { io } from "../server.js";
import Settings from "../models/settings-model.js";

/* ================= FLAG/REPORT USER ================= */

const flagUser = async (req, res) => {
  try {
    const { reportedUserId, reason, description } = req.body;
    const reportedByNgoId = req.user.userId;

    // Only NGOs can flag users
    const ngo = await User.findById(reportedByNgoId);
    if (ngo.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can report users" });
    }

    // Check if user already flagged by this NGO
    const existingFlag = await UserFlag.findOne({
      reportedUserId,
      reportedByNgoId,
      status: "active",
    });

    if (existingFlag) {
      return res
        .status(400)
        .json({ message: "User already flagged by your organization" });
    }

    // Create flag
    const flag = await UserFlag.create({
      reportedUserId,
      reportedByNgoId,
      reason,
      description,
    });

    // Update user's flag count
    const totalFlags = await UserFlag.countDocuments({
      reportedUserId,
      status: "active",
    });

    const settings = await Settings.getInstance();
    const flagThreshold = settings.autoFlagThreshold || 3;

    if (totalFlags >= flagThreshold) {
      await User.findByIdAndUpdate(reportedUserId, {
        isFlaggedByAnyNGO: true,
        reportFlags: totalFlags,
      });
    }

    res.status(201).json({
      message: "User reported successfully",
      flag,
      totalFlags,
    });
  } catch (error) {
    console.error("Flag user error:", error);
    res.status(500).json({ message: "Error reporting user" });
  }
};

/* ================= UNFLAG USER ================= */

const unflagUser = async (req, res) => {
  try {
    const { reportedUserId } = req.body;
    const reportedByNgoId = req.user.userId;

    // Only NGOs can unflag users
    const ngo = await User.findById(reportedByNgoId);
    if (ngo.role !== "ngo") {
      return res.status(403).json({ message: "Only NGOs can unflag users" });
    }

    // Update flag status
    const flag = await UserFlag.findOneAndUpdate(
      {
        reportedUserId,
        reportedByNgoId,
        status: "active",
      },
      { status: "resolved" },
      { new: true },
    );

    if (!flag) {
      return res.status(404).json({ message: "Flag not found" });
    }

    // Update user's flag count
    const totalFlags = await UserFlag.countDocuments({
      reportedUserId,
      status: "active",
    });

    const settings = await Settings.getInstance();
    const flagThreshold = settings.autoFlagThreshold || 3;

    if (totalFlags < flagThreshold) {
      await User.findByIdAndUpdate(reportedUserId, {
        isFlaggedByAnyNGO: false,
        reportFlags: totalFlags,
      });
    } else {
      // Just update the count
      await User.findByIdAndUpdate(reportedUserId, {
        reportFlags: totalFlags,
      });
    }

    res.json({
      message: "User unflagged successfully",
      flag,
      totalFlags,
    });
  } catch (error) {
    console.error("Unflag user error:", error);
    res.status(500).json({ message: "Error unflagging user" });
  }
};

/* ================= GET MESSAGES ================= */

const getMessages = async (req, res) => {
  try {
    const myId = req.user.userId;
    const otherId = req.params.userId;

    // Get user info with online status
    const otherUser = await User.findById(otherId).select(
      "isOnline lastSeen name profileImage",
    );

    const conversationId =
      myId < otherId ? `${myId}_${otherId}` : `${otherId}_${myId}`;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.json({
      messages,
      userStatus: {
        isOnline: otherUser.isOnline,
        lastSeen: otherUser.lastSeen,
      },
    });
  } catch (error) {
    console.error("Get messages error:", error);
    res.status(500).json({ message: "Error loading messages" });
  }
};

/* ================= SEND MESSAGE ================= */

const sendMessage = async (req, res) => {
  try {
    const sender_id = req.user.userId;
    const { receiver_id, content } = req.body;

    if (!content || !receiver_id) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // Get receiver details
    const receiver = await User.findById(receiver_id);
    if (!receiver) {
      return res.status(404).json({ message: "Receiver not found" });
    }

    // Check if sender is flagged by this NGO (if receiver is NGO)
    if (receiver.role === "ngo") {
      const settings = await Settings.getInstance();
      const flagThreshold = settings.autoFlagThreshold || 3;

      const flag = await UserFlag.findOne({
        reportedUserId: sender_id,
        reportedByNgoId: receiver_id,
        status: "active",
      });

      // If user has been flagged by this NGO, check if they exceed threshold
      if (flag) {
        const totalFlags = await UserFlag.countDocuments({
          reportedUserId: sender_id,
          status: "active",
        });

        if (totalFlags >= flagThreshold) {
          return res.status(403).json({
            message:
              "You are blocked by this NGO due to multiple reports. Please contact admin for assistance.",
            blocked: true,
          });
        }
      }
    }

    const conversationId =
      sender_id < receiver_id
        ? `${sender_id}_${receiver_id}`
        : `${receiver_id}_${sender_id}`;

    const message = await Message.create({
      sender_id,
      receiver_id,
      content,
      conversationId,
    });

    /* ================= REALTIME MESSAGE ================= */

    io.to(receiver_id).emit("new_message", message);
    io.to(sender_id).emit("new_message", message);

    /* ================= CREATE NOTIFICATION ================= */

    const sender = await User.findById(sender_id).select("name profileImage");

    const notification = await Notification.create({
      userId: receiver_id,
      type: "message",
      message: `${sender.name} sent you a message`,
      link: "/messages",
      sender: {
        name: sender.name,
        image: sender.profileImage,
      },
    });

    /* ================= REALTIME NOTIFICATION ================= */

    io.to(receiver_id.toString()).emit("new_notification", notification);

    res.json(message);
  } catch (error) {
    console.error("Send message error:", error);
    res.status(500).json({ message: "Error sending message" });
  }
};

/* ================= GET CONVERSATIONS ================= */

const getConversations = async (req, res) => {
  try {
    const myId = req.user.userId;
    const myObjectId = new mongoose.Types.ObjectId(myId);

    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [{ sender_id: myObjectId }, { receiver_id: myObjectId }],
        },
      },
      { $sort: { createdAt: -1 } },

      {
        $group: {
          _id: "$conversationId",
          lastMessage: { $first: "$content" },
          sender: { $first: "$sender_id" },
          receiver: { $first: "$receiver_id" },
          createdAt: { $first: "$createdAt" },
        },
      },
    ]);

    const populated = await Promise.all(
      conversations.map(async (conv) => {
        const otherUserId =
          conv.sender.toString() === myId ? conv.receiver : conv.sender;

        const user = await User.findById(otherUserId).select(
          "_id name profileImage role isOnline lastSeen isFlaggedByAnyNGO reportFlags",
        );

        return {
          ...conv,
          user,
        };
      }),
    );

    res.json(populated);
  } catch (error) {
    console.error("Conversation error:", error);
    res.status(500).json({ message: "Error loading conversations" });
  }
};

export default {
  getMessages,
  sendMessage,
  getConversations,
  flagUser,
  unflagUser,
};
