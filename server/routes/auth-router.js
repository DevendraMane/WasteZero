import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import User from "../models/user-model.js";

const router = express.Router();

// 🔥 Get All Users (Admin Only)
router.get("/users", authMiddleware, async (req, res) => {
  try {
    // Check if admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
