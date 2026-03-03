import "dotenv/config"; // MUST BE FIRST

import express from "express";
import cors from "cors";
import connectDB from "./utils/db.js";
import { authRouter } from "./routes/auth-router.js";
import opportunityRouter from "./routes/opportunity-router.js";
import adminRouter from "./routes/admin-router.js";
import applicationRouter from "./routes/application-router.js";
import pickupRouter from "./routes/pickup-router.js";
import imageRouter from "./routes/image-router.js";

import passport from "passport";
import "./config/passport.js";

import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 5000;

/* ================= CREATE UPLOADS FOLDER IF NOT EXISTS ================= */

const uploadsPath = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

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

/* ================= STATIC FILES ================= */

app.use("/uploads", express.static(uploadsPath));

/* ================= ROUTES ================= */

app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/admin", adminRouter);
app.use("/api/applications", applicationRouter);
app.use("/api/pickups", pickupRouter);
app.use("/api/image", imageRouter);

/* ================= START SERVER ================= */

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
