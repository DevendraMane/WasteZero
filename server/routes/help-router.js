import express from "express";
import { reportIssue, reportUser } from "../controllers/help-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// POST /api/help/report-issue - Submit an issue report
router.post("/report-issue", authMiddleware, reportIssue);

// POST /api/help/report-user - Report a user for misconduct
router.post("/report-user", authMiddleware, reportUser);

export default router;
