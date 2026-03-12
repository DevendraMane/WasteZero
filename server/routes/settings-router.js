import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import settingsController from "../controllers/settings-controller.js";

const router = express.Router();

// Anyone can view settings (for frontend enforcement)
router.get("/", settingsController.getSettings);

// Only admins can update settings
router.put("/", authMiddleware, settingsController.updateSettings);

export default router;
