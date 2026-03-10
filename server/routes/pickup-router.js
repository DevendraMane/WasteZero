import express from "express";
import pickupController from "../controllers/pickup-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const pickupRouter = express.Router();

pickupRouter.post("/", authMiddleware, pickupController.createPickup);

pickupRouter.get(
  "/volunteer",
  authMiddleware,
  pickupController.getVolunteerPickups,
);

pickupRouter.get("/ngo", authMiddleware, pickupController.getNGOPickups);

pickupRouter.put("/assign/:id", authMiddleware, pickupController.assignAgent);

pickupRouter.put(
  "/status/:id",
  authMiddleware,
  pickupController.updatePickupStatus,
);

/* FIXED ROUTE */
pickupRouter.put("/:id", authMiddleware, pickupController.updatePickup);

export default pickupRouter;
