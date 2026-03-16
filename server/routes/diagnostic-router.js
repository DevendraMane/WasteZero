import express from "express";
import logger from "../utils/logger.js";
const diagnosticRouter = express.Router();

// ================= DIAGNOSTIC ENDPOINT =================
// WARNING: Only use this for debugging, remove before production if sensitive
diagnosticRouter.get("/check-env", (req, res) => {
  const diagnostics = {
    email_user_set: !!process.env.EMAIL_USER,
    email_user_masked: process.env.EMAIL_USER
      ? process.env.EMAIL_USER.replace(/(.{2})(.*)(@.*)/, "$1***$3")
      : "NOT SET",
    email_pass_set: !!process.env.EMAIL_PASS,
    email_pass_length: process.env.EMAIL_PASS?.length || 0,
    backend_url: process.env.BACKEND_URL,
    client_url: process.env.CLIENT_URL,
    node_env: process.env.NODE_ENV,
    port: process.env.PORT || 5000,
    timestamp: new Date().toISOString(),
  };

  logger.log("[DIAGNOSTIC] Environment check:", diagnostics);

  res.json({
    status: "Environment variables check",
    ...diagnostics,
    message: diagnostics.email_user_set
      ? "✅ Email credentials are configured"
      : "❌ Email credentials NOT configured",
  });
});

// ================= EMAIL TEST ENDPOINT =================
diagnosticRouter.post("/test-email", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    logger.log(`[DIAGNOSTIC] Testing email send to: ${email}`);

    // Import here to use current .env
    const { sendVerificationEmail } = await import(
      "../utils/sendEmail.js"
    );

    const testToken = "test_token_" + Date.now();
    await sendVerificationEmail(email, testToken);

    logger.log(`[DIAGNOSTIC] Email test successful for ${email}`);

    res.json({
      status: "success",
      message: "Test email sent successfully",
      backend_url: process.env.BACKEND_URL,
      email_sent_to: email,
      verification_link: `${process.env.BACKEND_URL}/api/auth/verify/${testToken}`,
    });
  } catch (error) {
    logger.error("[DIAGNOSTIC] Email test failed:", error.message);

    res.status(500).json({
      status: "error",
      message: error.message,
      error_details: error.toString(),
    });
  }
});

export default diagnosticRouter;
