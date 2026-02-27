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

export default pickupRouter;
