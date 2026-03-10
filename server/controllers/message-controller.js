import Message from "../models/message-model.js";
import User from "../models/user-model.js";
import Notification from "../models/notification-model.js";
import mongoose from "mongoose";
import { io } from "../server.js";

/* ================= GET MESSAGES ================= */

const getMessages = async (req, res) => {
  try {
    const myId = req.user.userId;
    const otherId = req.params.userId;

    const conversationId =
      myId < otherId ? `${myId}_${otherId}` : `${otherId}_${myId}`;

    const messages = await Message.find({ conversationId }).sort({
      createdAt: 1,
    });

    res.json(messages);
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
          "_id name profileImage role",
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
};
