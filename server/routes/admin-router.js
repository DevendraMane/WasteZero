import express from "express";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import adminController from "../controllers/admin-controller.js";

const router = express.Router();

router.get("/users", authMiddleware, adminController.getAllUsers);

router.patch(
  "/users/:id/suspend",
  authMiddleware,
  adminController.toggleSuspendUser,
);

export default router;
