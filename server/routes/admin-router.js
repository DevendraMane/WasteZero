import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import adminController from "../controllers/admin-controller.js";

const router = express.Router();

router.get(
  "/dashboard-stats",
  authMiddleware,
  adminController.getDashboardStats,
);

router.get("/analytics", authMiddleware, adminController.getAnalytics);

router.get("/users", authMiddleware, adminController.getAllUsers);

router.patch(
  "/users/:id/suspend",
  authMiddleware,
  adminController.toggleSuspendUser,
);

router.get("/export/users", authMiddleware, adminController.exportUsersCSV);

router.get("/export/pickups", authMiddleware, adminController.exportPickupsCSV);

router.get(
  "/export/full-report",
  authMiddleware,
  adminController.exportFullReport,
);

export default router;
