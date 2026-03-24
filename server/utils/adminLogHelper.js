import AdminLog from "../models/admin-log-model.js";
import logger from "./logger.js";

export const logAdminAction = async (
  action,
  targetId,
  targetType,
  adminId,
  adminName,
  adminEmail,
  description = "",
  ipAddress = "",
  status = "success",
  errorMessage = "",
) => {
  try {
    const log = new AdminLog({
      action,
      target_id: targetId,
      targetType,
      admin_id: adminId,
      adminName,
      adminEmail,
      description,
      ipAddress,
      status,
      errorMessage,
    });

    await log.save();
    logger.log(`Admin action logged: ${action} by ${adminName}`);
  } catch (error) {
    logger.error("Failed to log admin action:", {
      error: error.message,
      action,
      adminId,
    });
  }
};

export const getClientIp = (req) => {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.connection.remoteAddress ||
    req.ip ||
    "unknown"
  );
};

export const getUserAgent = (req) => {
  return req.headers["user-agent"] || "unknown";
};
