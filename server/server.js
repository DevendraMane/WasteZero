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
import passport from "passport";
import "./config/passport.js";

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

/* ================= ROUTES ================= */

app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/admin", adminRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/pickups", pickupRouter);
app.use("/api/image", imageRouter);
app.use("/api/notifications", notificationRouter);
app.use("/api/messages", messageRouter);
/* ================= CREATE SERVER ================= */

const server = http.createServer(app);

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
  },
});

export { io };

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log(`User joined room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

/* ================= START SERVER ================= */

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
