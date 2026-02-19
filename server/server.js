import express from "express";
import cors from "cors";
import { authRouter } from "./routes/auth-router.js";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import opportunityRouter from "./routes/opportunity-router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Proper CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/uploads", express.static("uploads"));

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
