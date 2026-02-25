import express from "express";
import applicationController from "../controllers/application-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const applicationRouter = express.Router();

applicationRouter.post(
  "/:opportunityId",
  authMiddleware,
  applicationController.applyToOpportunity,
);

applicationRouter.get(
  "/check/:opportunityId",
  authMiddleware,
  applicationController.checkIfApplied,
);

applicationRouter.get(
  "/ngo",
  authMiddleware,
  applicationController.getApplicationsForNGO,
);

applicationRouter.patch(
  "/:id",
  authMiddleware,
  applicationController.updateApplicationStatus,
);

export default applicationRouter;
