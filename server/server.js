import "dotenv/config"; // MUST BE FIRST

import express from "express";
import cors from "cors";
import connectDB from "./utils/db.js";
import http from "http";
import { Server } from "socket.io";
import notificationRouter from "./routes/notification-router.js";
import { authRouter } from "./routes/auth-router.js";
import opportunityRouter from "./routes/opportunity-router.js";
import adminRouter from "./routes/admin-router.js";
import applicationRouter from "./routes/application-router.js";
import pickupRouter from "./routes/pickup-router.js";
import imageRouter from "./routes/image-router.js";
import messageRouter from "./routes/message-router.js";
import settingsRouter from "./routes/settings-router.js";
import helpRouter from "./routes/help-router.js";
import passport from "passport";
import "./config/passport.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "./middlewares/auth-middleware.js";
import { maintenanceModeMiddleware } from "./middlewares/settings-middleware.js";
import User from "./models/user-model.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= CORS ================= */

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  }),
);

/* ================= MIDDLEWARE ================= */

app.use(express.json());
app.use(passport.initialize());

// Apply optional auth middleware globally (populates req.user if valid token exists, but doesn't block)
app.use(optionalAuthMiddleware);

app.use(maintenanceModeMiddleware);

/* ================= ROUTES ================= */

app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/admin", adminRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/pickups", pickupRouter);
app.use("/api/image", imageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/messages", messageRouter);
app.use("/api/settings", settingsRouter);
app.use("/api/help", helpRouter);
/* ================= CREATE SERVER ================= */

const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export { io };

// Track online users in memory
const onlineUsers = new Map(); // Map of { userId: socketId }

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins and comes online
  socket.on("user_online", async (userId) => {
    // Validate userId exists and is not null
    if (!userId) {
      console.warn("user_online event received with null/undefined userId");
      return;
    }

    console.log(`[Socket] user_online event - userId: ${userId}`);
    onlineUsers.set(userId, socket.id);
    socket.join(userId.toString());

    // Update user's isOnline status in database
    try {
      await User.updateOne({ _id: userId }, { isOnline: true });
      console.log(`[Socket] Database updated - User ${userId} is online`);
    } catch (err) {
      console.error("Error updating user online status:", err);
    }

    // Broadcast user is online to all sockets (don't set lastSeen here)
    const statusUpdate = { userId, isOnline: true };
    io.emit("user_status_update", statusUpdate);
    console.log(
      `[Socket] Broadcasting status update to all clients:`,
      statusUpdate,
    );

    console.log(`User ${userId} is online`);
  });

  // User is typing
  socket.on("typing_start", (data) => {
    const { userId, conversationWith } = data;
    if (!userId || !conversationWith) {
      console.warn("typing_start received with missing data");
      return;
    }
    io.to(conversationWith.toString()).emit("typing_indicator", {
      userId,
      isTyping: true,
    });
  });

  // User stopped typing
  socket.on("typing_stop", (data) => {
    const { userId, conversationWith } = data;
    if (!userId || !conversationWith) {
      console.warn("typing_stop received with missing data");
      return;
    }
    io.to(conversationWith.toString()).emit("typing_indicator", {
      userId,
      isTyping: false,
    });
  });

  // Message sent
  socket.on("join", (userId) => {
    socket.join(userId.toString());
    console.log(`User joined room: ${userId}`);
  });

  // User disconnects / goes offline
  socket.on("disconnect", async () => {
    // Find which user this socket belongs to and update lastSeen
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);

        // Update user's last seen
        const User = (await import("./models/user-model.js")).default;
        await User.findByIdAndUpdate(userId, {
          isOnline: false,
          lastSeen: new Date(),
        });

        // Broadcast user is offline
        io.emit("user_status_update", {
          userId,
          isOnline: false,
          lastSeen: new Date(),
        });

        console.log(`User ${userId} is offline`);
        break;
      }
    }
    console.log("User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
