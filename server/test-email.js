import "dotenv/config";
import { sendVerificationEmail } from "./utils/sendEmail.js";
import logger from "./utils/logger.js";

// Test email sending
const testEmail = async () => {
  logger.log("[TEST] Starting email send test...");
  logger.log(`[TEST] EMAIL_USER: ${process.env.EMAIL_USER}`);
  logger.log(`[TEST] BACKEND_URL: ${process.env.BACKEND_URL}`);

  try {
    const testToken = "test_token_12345";
    const testRecipient = "test@example.com";

    logger.log(`[TEST] Attempting to send test email to: ${testRecipient}`);

    const result = await sendVerificationEmail(testRecipient, testToken);

    logger.log("[TEST] Email sent successfully!");
    logger.log(`[TEST] Message ID: ${result.messageId}`);
    logger.log("[TEST] Response:", result);

    process.exit(0);
  } catch (error) {
    logger.error("[TEST] Email send failed!");
    logger.error("[TEST] Error message:", error.message);
    logger.error("[TEST] Full error:", error);

    process.exit(1);
  }
};

testEmail();
