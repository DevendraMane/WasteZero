import express from "express";
import cors from "cors";
import connectDB from "./utils/db.js";
import dotenv from "dotenv";
import opportunityRouter from "./routes/opportunity-router.js";
import authRouter from "./routes/auth-router.js";
import adminRouter from "./routes/admin-router.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ Proper CORS configuration
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRouter);
app.use("/api/opportunities", opportunityRouter);
app.use("/uploads", express.static("uploads"));
app.use("/api/admin", adminRouter);

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is Running on ${PORT}`);
  });
});
