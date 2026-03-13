import express from "express";
import { reportIssue } from "../controllers/help-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

// POST /api/help/report-issue - Submit an issue report
router.post("/report-issue", authMiddleware, reportIssue);

export default router;
