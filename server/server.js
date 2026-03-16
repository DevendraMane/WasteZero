import "dotenv/config"; // MUST BE FIRST

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
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
import diagnosticRouter from "./routes/diagnostic-router.js";
import passport from "passport";
import "./config/passport.js";
import {
  authMiddleware,
  optionalAuthMiddleware,
} from "./middlewares/auth-middleware.js";
import { maintenanceModeMiddleware } from "./middlewares/settings-middleware.js";
import User from "./models/user-model.js";
import logger from "./utils/logger.js";

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CLIENT_URL,
  ...(process.env.CLIENT_URLS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
].filter(Boolean);

if (allowedOrigins.length === 0) {
  logger.warn(
    "[CORS] No allowed origins configured. Set CLIENT_URL or CLIENT_URLS.",
  );
}

const isOriginAllowed = (origin) => allowedOrigins.includes(origin);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests without Origin header (server-to-server, health checks, CLI tools).
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin)) return callback(null, true);

    logger.warn("[CORS] Blocked origin", { origin });
    return callback(new Error("Not allowed by CORS"));
  },
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  credentials: true,
};

const getRetryAfter = (resetTime, fallbackMs) => {
  const fallbackSeconds = Math.ceil(fallbackMs / 1000);
  if (!resetTime) return fallbackSeconds;

  const seconds = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
  return Math.max(1, seconds);
};

const createLimiter = (max, message, options = {}) =>
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
      const retryAfterSeconds = getRetryAfter(
        req.rateLimit?.resetTime,
        15 * 60 * 1000,
      );
      const retryAfterMinutes = Math.ceil(retryAfterSeconds / 60);

      res.set("Retry-After", String(retryAfterSeconds));

      return res.status(429).json({
        message: `${message} Try again in about ${retryAfterMinutes} minute${
          retryAfterMinutes === 1 ? "" : "s"
        }.`,
        retryAfterSeconds,
        retryAfterMinutes,
      });
    },
    ...options,
  });

// Baseline limiter for all API routes.
const apiLimiter = createLimiter(
  300,
  "Too many requests, please try again later.",
);

// Moderate limiter for auth endpoints overall.
const authLimiter = createLimiter(
  80,
  "Too many authentication requests, please try again later.",
);

// Strict limiter for brute-force sensitive endpoints.
const loginLimiter = createLimiter(
  10,
  "Too many login attempts, please try again in 15 minutes.",
  { skipSuccessfulRequests: true },
);

const passwordResetLimiter = createLimiter(
  5,
  "Too many password reset attempts, please try again in 15 minutes.",
);

/* ================= CORS ================= */

app.use(cors(corsOptions));

/* ================= MIDDLEWARE ================= */

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use("/api", apiLimiter);

// Apply stricter route-level limiters before auth router.
app.use("/api/auth", authLimiter);
app.use("/api/auth/login", loginLimiter);
app.use("/api/auth/forgot-password", passwordResetLimiter);
app.use("/api/auth/reset-password", passwordResetLimiter);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
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
app.use("/api/diagnostics", diagnosticRouter);
/* ================= CREATE SERVER ================= */

const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  },
});

export { io };

// Track online users in memory
const onlineUsers = new Map(); // Map of { userId: socketId }

io.on("connection", (socket) => {
  logger.log("User connected:", socket.id);

  // User joins and comes online
  socket.on("user_online", async (userId) => {
    // Validate userId exists and is not null
    if (!userId) {
      logger.warn("user_online event received with null/undefined userId");
      return;
    }

    logger.log(`[Socket] user_online event - userId: ${userId}`);
    onlineUsers.set(userId, socket.id);
    socket.join(userId.toString());

    // Update user's isOnline status in database
    try {
      await User.updateOne({ _id: userId }, { isOnline: true });
      logger.log(`[Socket] Database updated - User ${userId} is online`);
    } catch (err) {
      logger.error("Error updating user online status:", err);
    }

    // Broadcast user is online to all sockets (don't set lastSeen here)
    const statusUpdate = { userId, isOnline: true };
    io.emit("user_status_update", statusUpdate);
    logger.log(
      `[Socket] Broadcasting status update to all clients:`,
      statusUpdate,
    );

    logger.log(`User ${userId} is online`);
  });

  // User is typing
  socket.on("typing_start", (data) => {
    const { userId, conversationWith } = data;
    if (!userId || !conversationWith) {
      logger.warn("typing_start received with missing data");
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
      logger.warn("typing_stop received with missing data");
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
    logger.log(`User joined room: ${userId}`);
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

        logger.log(`User ${userId} is offline`);
        break;
      }
    }
    logger.log("User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */

connectDB().then(() => {
  server.listen(PORT, () => {
    logger.log(`Server is Running on ${PORT}`);
  });
});
