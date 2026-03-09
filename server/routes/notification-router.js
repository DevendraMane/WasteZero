import express from "express";
import notificationController from "../controllers/notification-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const notificationRouter = express.Router();

/* GET USER NOTIFICATIONS */
notificationRouter.get(
  "/",
  authMiddleware,
  notificationController.getUserNotifications,
);

/* MARK ALL AS READ */
notificationRouter.patch(
  "/read",
  authMiddleware,
  notificationController.markNotificationsRead,
);

notificationRouter.patch(
  "/:id/read",
  authMiddleware,
  notificationController.markSingleNotificationRead,
);

export default notificationRouter;
