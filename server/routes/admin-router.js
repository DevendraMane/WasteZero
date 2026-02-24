import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import User from "../models/user-model.js";

const router = express.Router();

/*
--------------------------------------------------
GET ALL USERS (Admin Only)
--------------------------------------------------
*/
router.get("/users", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const users = await User.find().select("-password");

    res.status(200).json(users);
  } catch (error) {
    console.error("Fetch users error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

/*
--------------------------------------------------
SUSPEND / UNSUSPEND USER
--------------------------------------------------
*/
router.patch("/users/:id/suspend", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Access denied" });
    }

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ❌ Prevent admin suspending himself
    if (user.role === "admin") {
      return res.status(400).json({
        message: "Cannot suspend another admin",
      });
    }

    // Toggle suspension
    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      message: user.isSuspended
        ? "User suspended successfully"
        : "User unsuspended successfully",
      isSuspended: user.isSuspended,
    });
  } catch (error) {
    console.error("Suspend error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
