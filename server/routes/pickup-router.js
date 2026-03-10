import express from "express";
import pickupController from "../controllers/pickup-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const pickupRouter = express.Router();

/* CREATE PICKUP */

pickupRouter.post("/", authMiddleware, pickupController.createPickup);

/* VOLUNTEER PICKUPS */

pickupRouter.get(
  "/volunteer",
  authMiddleware,
  pickupController.getVolunteerPickups,
);

/* NGO PICKUPS */

pickupRouter.get("/ngo", authMiddleware, pickupController.getNGOPickups);

/* ASSIGN AGENT */

pickupRouter.put("/assign/:id", authMiddleware, pickupController.assignAgent);

/* UPDATE STATUS */

pickupRouter.put(
  "/status/:id",
  authMiddleware,
  pickupController.updatePickupStatus,
);

/* UPDATE PICKUP */

pickupRouter.put("/:id", authMiddleware, pickupController.updatePickup);

export default pickupRouter;
