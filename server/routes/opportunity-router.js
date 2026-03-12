import express from "express";
import opportunityController from "../controllers/opportunity-controller.js";
import { upload } from "../middlewares/upload.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { checkFeatureToggle } from "../middlewares/settings-middleware.js";

const opportunityRouter = express.Router();

/* CREATE OPPORTUNITY */

opportunityRouter.post(
  "/",
  authMiddleware,
  checkFeatureToggle("allowOpportunities"),
  upload.single("image"),
  opportunityController.createOpportunity,
);

/* GET NGO OPPORTUNITIES (MUST BE BEFORE :id) */

opportunityRouter.get(
  "/ngo/my",
  authMiddleware,
  opportunityController.getOpportunitiesForNGO,
);

/* GET ALL */

opportunityRouter.get(
  "/",
  authMiddleware,
  opportunityController.getAllOpportunities,
);

/* GET SINGLE */

opportunityRouter.get(
  "/:id",
  authMiddleware,
  opportunityController.getSingleOpportunity,
);

/* DELETE */

opportunityRouter.delete(
  "/:id",
  authMiddleware,
  opportunityController.deleteOpportunity,
);

/* UPDATE */

opportunityRouter.put(
  "/:id",
  authMiddleware,
  upload.single("image"),
  opportunityController.updateOpportunity,
);

export default opportunityRouter;
