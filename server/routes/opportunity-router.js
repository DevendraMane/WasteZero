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

export default opportunityRouter;
