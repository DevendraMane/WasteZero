import express from "express";
import opportunityController from "../controllers/opportunity-controller.js";

import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const opportunityRouter = express.Router();

opportunityRouter.post(
  "/",
  authMiddleware,
  upload.single("image"),
  opportunityController.createOpportunity,
);

opportunityRouter.get(
  "/",
  authMiddleware,
  opportunityController.getAllOpportunities,
);

opportunityRouter.get(
  "/:id",
  authMiddleware,
  opportunityController.getSingleOpportunity,
);

opportunityRouter.delete(
  "/:id",
  authMiddleware,
  opportunityController.deleteOpportunity,
);

opportunityRouter.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  opportunityController.updateOpportunity,
);

opportunityRouter.get(
  "/ngo/my",
  authMiddleware,
  opportunityController.getOpportunitiesForNGO,
);

export default opportunityRouter;
