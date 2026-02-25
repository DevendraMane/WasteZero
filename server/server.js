import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import connectDB from "./utils/db.js";
import { authRouter } from "./routes/auth-router.js";
import opportunityRouter from "./routes/opportunity-router.js";
import adminRouter from "./routes/admin-router.js"; // ✅ ADD THIS
import applicationRouter from "./routes/application-router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Proper CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // ✅ add PATCH
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Static folder
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/api/admin", adminRouter); // ✅ THIS WAS MISSING
app.use("/api/applications", applicationRouter);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
