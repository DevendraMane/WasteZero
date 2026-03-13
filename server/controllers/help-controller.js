import User from "../models/user-model.js";
import {
  sendIssueReportEmail,
  sendUserReportEmail,
} from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

// ================= REPORT ISSUE =================
export const reportIssue = async (req, res) => {
  try {
    const { issueType, subject, description } = req.body;
    const userId = req.user.userId;

    // Validate required fields
    if (!issueType || !subject || !description) {
      return res.status(400).json({
        message: "Issue type, subject, and description are required",
      });
    }

    // Get user info
    const user = await User.findById(userId).select("name email role");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Get admin email(s)
    const admins = await User.find({ role: "admin" }).select("email");

    if (admins.length === 0) {
      logger.warn("[REPORT ISSUE] No admin users found in database");
      return res.status(500).json({
        message: "Admin contact not available. Please use support email.",
      });
    }

    // Send email to each admin
    const reportData = {
      issueType,
      subject,
      description,
      userEmail: user.email,
      userName: user.name,
      userRole: user.role,
    };

    const emailPromises = admins.map((admin) =>
      sendIssueReportEmail(admin.email, reportData),
    );

    await Promise.all(emailPromises);

    logger.log(
      `[REPORT ISSUE] Issue reported by ${user.email} (${user.role}) - Type: ${issueType}`,
    );

    res.status(200).json({
      message:
        "Thank you for reporting this issue! Our admin team will review it shortly.",
    });
  } catch (error) {
    logger.error("[REPORT ISSUE ERROR]:", error);
    res.status(500).json({
      message: "Failed to submit report. Please try again later.",
    });
  }
};

// ================= REPORT USER =================
export const reportUser = async (req, res) => {
  try {
    const { reportedUserId, reportReason, reportDescription } = req.body;
    const reporterId = req.user.userId;

    // Validate required fields
    if (!reportedUserId || !reportReason || !reportDescription) {
      return res.status(400).json({
        message: "Reported user ID, reason, and description are required",
      });
    }

    // Prevent users from reporting themselves
    if (reportedUserId === reporterId) {
      return res.status(400).json({
        message: "You cannot report yourself",
      });
    }

    // Get reporter info
    const reporter = await User.findById(reporterId).select("name email role");

    if (!reporter) {
      return res.status(404).json({
        message: "Reporter not found",
      });
    }

    // Get reported user info
    const reportedUser =
      await User.findById(reportedUserId).select("name email role");

    if (!reportedUser) {
      return res.status(404).json({
        message: "Reported user not found",
      });
    }

    // Get admin email(s)
    const admins = await User.find({ role: "admin" }).select("email");

    if (admins.length === 0) {
      logger.warn("[REPORT USER] No admin users found in database");
      return res.status(500).json({
        message: "Admin contact not available. Please use support email.",
      });
    }

    // Send email to each admin
    const reportData = {
      reportedUserName: reportedUser.name,
      reportedUserEmail: reportedUser.email,
      reportedUserRole: reportedUser.role,
      reportReason,
      reportDescription,
      reporterName: reporter.name,
      reporterEmail: reporter.email,
      reporterRole: reporter.role,
    };

    const emailPromises = admins.map((admin) =>
      sendUserReportEmail(admin.email, reportData),
    );

    await Promise.all(emailPromises);

    logger.log(
      `[REPORT USER] User ${reportedUser.name} (${reportedUser.email}) reported by ${reporter.name} (${reporter.email}) - Reason: ${reportReason}`,
    );

    res.status(200).json({
      message:
        "Thank you for reporting this user! Our admin team will review it and take appropriate action shortly.",
    });
  } catch (error) {
    logger.error("[REPORT USER ERROR]:", error);
    res.status(500).json({
      message: "Failed to submit report. Please try again later.",
    });
  }
};

export default {
  reportIssue,
  reportUser,
};
