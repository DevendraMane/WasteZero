import nodemailer from "nodemailer";
import logger from "./logger.js";

// ================= CREATE TRANSPORTER =================
// Check if email credentials exist
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  logger.error(
    "[EMAIL CONFIG] Missing EMAIL_USER or EMAIL_PASS in environment variables!",
  );
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter connection at startup
transporter.verify((error, success) => {
  if (error) {
    logger.error("[EMAIL TRANSPORTER] Connection failed:", error.message);
  } else {
    logger.log("[EMAIL TRANSPORTER] Connected successfully. Ready to send emails.");
  }
});

// ================= EMAIL VERIFICATION =================
export const sendVerificationEmail = async (email, token) => {
  try {
    const verifyURL = `${process.env.BACKEND_URL}/api/auth/verify/${token}`;

    const mailOptions = {
      from: `"WasteZero ♻" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Verify your WasteZero account",
      html: `
        <div style="font-family: Arial; padding:20px;">
          <h2>Welcome to WasteZero ♻</h2>
          <p>Click below to verify your email:</p>

          <a href="${verifyURL}"
            style="
              background:#1976d2;
              color:white;
              padding:10px 20px;
              text-decoration:none;
              border-radius:5px;
              display:inline-block;
            ">
            Verify Email
          </a>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    logger.log(
      `[EMAIL VERIFICATION] Email sent successfully to ${email}. Message ID: ${info.messageId}`,
    );
    return info;
  } catch (error) {
    logger.error(
      `[EMAIL VERIFICATION ERROR] Failed to send verification email to ${email}:`,
      error.message,
    );
    throw error;
  }
};

// ================= FORGOT PASSWORD EMAIL =================
export const sendResetPasswordEmail = async (email, resetUrl) => {
  const mailOptions = {
    from: `"WasteZero ♻" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Reset Your WasteZero Password",
    html: `
      <div style="font-family: Arial; padding:20px;">
        <h2>Password Reset Request 🔐</h2>

        <p>You requested to reset your password.</p>

        <a href="${resetUrl}"
          style="
            background:#e53935;
            color:white;
            padding:10px 20px;
            text-decoration:none;
            border-radius:5px;
            display:inline-block;
          ">
          Reset Password
        </a>

        <p style="margin-top:15px;">
          This link will expire in 15 minutes.
        </p>

        <p>If you didn’t request this, ignore this email.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
// ================= OPPORTUNITY NOTIFICATION EMAIL (To Volunteers) =================
export const sendOpportunityNotificationEmail = async (
  email,
  opportunityData,
) => {
  const { title, description, location, ngoName } = opportunityData;

  const mailOptions = {
    from: `"WasteZero ♻" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `🌱 New Opportunity: ${title}`,
    html: `
      <div style="font-family: Arial; padding:20px; background:#f5f5f5;">
        <div style="background:white; padding:20px; border-radius:10px; max-width:600px; margin:0 auto;">
          <h2 style="color:#2e7d32;">🌱 New Opportunity Available!</h2>
          
          <p style="font-size:16px;">Hi there!</p>
          
          <p><strong>${ngoName}</strong> has posted a new opportunity for you:</p>
          
          <div style="background:#e8f5e9; padding:15px; border-left:4px solid #2e7d32; margin:15px 0;">
            <h3 style="color:#2e7d32; margin:0 0 10px 0;">${title}</h3>
            <p style="margin:5px 0;"><strong>Description:</strong> ${description}</p>
            <p style="margin:5px 0;"><strong>Location:</strong> ${location}</p>
          </div>

          <a href="${process.env.CLIENT_URL}/opportunities"
            style="
              background:#2e7d32;
              color:white;
              padding:12px 24px;
              text-decoration:none;
              border-radius:5px;
              display:inline-block;
              margin-top:10px;
            ">
            View Opportunity
          </a>

          <p style="margin-top:20px; color:#666; font-size:14px;">
            Thank you for being part of WasteZero ♻<br>
            Help us build a cleaner future!
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ================= PICKUP NOTIFICATION EMAIL (To NGO) =================
export const sendPickupNotificationEmail = async (email, pickupData) => {
  const {
    location,
    itemType,
    quantity,
    scheduledDate,
    volunteerName,
    volunteerPhone,
  } = pickupData;

  const mailOptions = {
    from: `"WasteZero ♻" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: `📦 New Pickup Scheduled for ${new Date(scheduledDate).toLocaleDateString()}`,
    html: `
      <div style="font-family: Arial; padding:20px; background:#f5f5f5;">
        <div style="background:white; padding:20px; border-radius:10px; max-width:600px; margin:0 auto;">
          <h2 style="color:#1565c0;">📦 New Pickup Scheduled!</h2>
          
          <p style="font-size:16px;">Hi there!</p>
          
          <p><strong>${volunteerName}</strong> has scheduled a new pickup:</p>
          
          <div style="background:#e3f2fd; padding:15px; border-left:4px solid #1565c0; margin:15px 0;">
            <h3 style="color:#1565c0; margin:0 0 10px 0;">Pickup Details</h3>
            <p style="margin:8px 0;"><strong>Item Type:</strong> ${itemType}</p>
            <p style="margin:8px 0;"><strong>Quantity:</strong> ${quantity}</p>
            <p style="margin:8px 0;"><strong>Location:</strong> ${location}</p>
            <p style="margin:8px 0;"><strong>Scheduled Date:</strong> ${new Date(scheduledDate).toLocaleDateString()} ${new Date(scheduledDate).toLocaleTimeString()}</p>
            <p style="margin:8px 0;"><strong>Volunteer:</strong> ${volunteerName}</p>
            <p style="margin:8px 0;"><strong>Contact:</strong> ${volunteerPhone}</p>
          </div>

          <a href="${process.env.CLIENT_URL}/pickups"
            style="
              background:#1565c0;
              color:white;
              padding:12px 24px;
              text-decoration:none;
              border-radius:5px;
              display:inline-block;
              margin-top:10px;
            ">
            View Pickup Details
          </a>

          <p style="margin-top:20px; color:#666; font-size:14px;">
            </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ================= ISSUE REPORT NOTIFICATION EMAIL (To Admin) =================
export const sendIssueReportEmail = async (adminEmail, reportData) => {
  const { issueType, subject, description, userEmail, userName, userRole } =
    reportData;

  const mailOptions = {
    from: `"WasteZero ♻" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `[${issueType.toUpperCase()}] ${subject}`,
    html: `
      <div style="font-family: Arial; padding:20px; background:#f5f5f5;">
        <div style="background:white; padding:20px; border-radius:10px; max-width:600px; margin:0 auto;">
          <h2 style="color:#d32f2f;">🚨 New Issue Report Submitted</h2>
          
          <div style="background:#fff3e0; padding:15px; border-left:4px solid #ff9800; margin:15px 0;">
            <h3 style="color:#e65100; margin:0 0 10px 0;">Issue Details</h3>
            <p style="margin:8px 0;"><strong>Issue Type:</strong> ${issueType.charAt(0).toUpperCase() + issueType.slice(1)}</p>
            <p style="margin:8px 0;"><strong>Subject:</strong> ${subject}</p>
            <p style="margin:8px 0;"><strong>Description:</strong></p>
            <p style="margin:8px 0; background:#f5f5f5; padding:10px; border-radius:5px; white-space:pre-wrap;">${description}</p>
          </div>

          <div style="background:#e3f2fd; padding:15px; border-left:4px solid #1976d2; margin:15px 0;">
            <h3 style="color:#0d47a1; margin:0 0 10px 0;">Reporter Information</h3>
            <p style="margin:8px 0;"><strong>Name:</strong> ${userName}</p>
            <p style="margin:8px 0;"><strong>Email:</strong> ${userEmail}</p>
            <p style="margin:8px 0;"><strong>Role:</strong> ${userRole.charAt(0).toUpperCase() + userRole.slice(1)}</p>
          </div>

          <div style="background:#f5f5f5; padding:15px; border-radius:5px; margin:15px 0;">
            <p style="margin:0; font-size:12px; color:#666;">
              <strong>Report ID:</strong> ${Date.now()}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>

          <p style="margin-top:20px; color:#666; font-size:14px;">
            Please review this report and take appropriate action.<br>
            <strong>WasteZero Admin System</strong> ♻
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ================= USER REPORT EMAIL (To Admins) =================
export const sendUserReportEmail = async (adminEmail, reportData) => {
  const {
    reportedUserName,
    reportedUserEmail,
    reportedUserRole,
    reportReason,
    reportDescription,
    reporterName,
    reporterEmail,
    reporterRole,
  } = reportData;

  const mailOptions = {
    from: `"WasteZero ♻ - Admin Alert" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    subject: `⚠️ User Report: ${reportedUserName} - Action Required`,
    html: `
      <div style="font-family: Arial; padding:20px; background:#fafafa;">
        <div style="background:white; padding:25px; border-radius:10px; max-width:650px; margin:0 auto; border-left:5px solid #d32f2f;">
          <h2 style="color:#d32f2f; margin:0 0 20px 0;">⚠️ User Report Submitted</h2>
          
          <p style="font-size:14px; margin:0 0 20px 0;">A user has been reported for misconduct. Please review and take appropriate action.</p>

          <div style="background:#ffebee; padding:15px; border-left:4px solid #d32f2f; margin:15px 0;">
            <h3 style="color:#c62828; margin:0 0 10px 0;">Reported User Details</h3>
            <p style="margin:8px 0;"><strong>Name:</strong> ${reportedUserName}</p>
            <p style="margin:8px 0;"><strong>Email:</strong> ${reportedUserEmail}</p>
            <p style="margin:8px 0;"><strong>Role:</strong> ${reportedUserRole.charAt(0).toUpperCase() + reportedUserRole.slice(1)}</p>
          </div>

          <div style="background:#fff3e0; padding:15px; border-left:4px solid #f57c00; margin:15px 0;">
            <h3 style="color:#e65100; margin:0 0 10px 0;">Report Details</h3>
            <p style="margin:8px 0;"><strong>Reason:</strong> ${reportReason}</p>
            <p style="margin:8px 0;"><strong>Description:</strong></p>
            <p style="margin:8px 0; background:#f5f5f5; padding:10px; border-radius:5px; white-space:pre-wrap;">${reportDescription}</p>
          </div>

          <div style="background:#e3f2fd; padding:15px; border-left:4px solid #1976d2; margin:15px 0;">
            <h3 style="color:#0d47a1; margin:0 0 10px 0;">Reporter Information</h3>
            <p style="margin:8px 0;"><strong>Name:</strong> ${reporterName}</p>
            <p style="margin:8px 0;"><strong>Email:</strong> ${reporterEmail}</p>
            <p style="margin:8px 0;"><strong>Role:</strong> ${reporterRole.charAt(0).toUpperCase() + reporterRole.slice(1)}</p>
          </div>

          <div style="background:#f5f5f5; padding:15px; border-radius:5px; margin:15px 0;">
            <p style="margin:0; font-size:12px; color:#666;">
              <strong>Report ID:</strong> ${Date.now()}<br>
              <strong>Submitted:</strong> ${new Date().toLocaleString()}
            </p>
          </div>

          <div style="background:#e8f5e9; padding:15px; border-radius:5px; margin:20px 0;">
            <p style="margin:0; font-size:14px; color:#2e7d32;">
              <strong>Recommended Action:</strong><br>
              1. Review the reported user's account and activity<br>
              2. If violation confirmed, suspend or ban the user<br>
              3. Update the reporter about the action taken<br>
            </p>
          </div>

          <p style="margin-top:20px; color:#666; font-size:13px; border-top:1px solid #ddd; padding-top:15px;">
            This is an automated notification from <strong>WasteZero Admin System</strong> ♻<br>
            Please check the admin dashboard for more details and to take action.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ================= ADMIN CODE MISMATCH ALERT EMAIL =================
export const sendAdminCodeMismatchAlertEmail = async (
  recipientEmail,
  attemptData,
) => {
  const {
    attemptedName,
    attemptedEmail,
    attemptedRole,
    ipAddress,
    userAgent,
    attemptedAt,
  } = attemptData;

  const mailOptions = {
    from: `"WasteZero Security Alert" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: "Security Alert: Invalid Admin Registration Code Attempt",
    html: `
      <div style="font-family: Arial; padding:20px; background:#f8fafc;">
        <div style="background:white; padding:20px; border-radius:10px; max-width:650px; margin:0 auto; border-left:5px solid #dc2626;">
          <h2 style="color:#b91c1c; margin:0 0 12px 0;">Security Alert: Invalid Admin Code Attempt</h2>
          <p style="margin:0 0 16px 0; color:#374151;">
            Someone attempted to create an account with <strong>admin</strong> role using an invalid secret code.
          </p>

          <div style="background:#fef2f2; padding:14px; border-radius:8px; margin-bottom:14px;">
            <p style="margin:6px 0;"><strong>Name:</strong> ${attemptedName || "N/A"}</p>
            <p style="margin:6px 0;"><strong>Email:</strong> ${attemptedEmail || "N/A"}</p>
            <p style="margin:6px 0;"><strong>Requested Role:</strong> ${attemptedRole || "N/A"}</p>
            <p style="margin:6px 0;"><strong>IP Address:</strong> ${ipAddress || "N/A"}</p>
            <p style="margin:6px 0;"><strong>User Agent:</strong> ${userAgent || "N/A"}</p>
            <p style="margin:6px 0;"><strong>Time:</strong> ${attemptedAt || new Date().toLocaleString()}</p>
          </div>

          <p style="margin:0; color:#4b5563; font-size:14px;">
            Please review logs and monitor suspicious activity from this source.
          </p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

// ================= USER SUSPENSION STATUS EMAIL =================
export const sendSuspensionStatusEmail = async (email, details) => {
  const { name, isSuspended, reason } = details;

  const subject = isSuspended
    ? "WasteZero Account Suspension Notice"
    : "WasteZero Account Reinstated";

  const statusColor = isSuspended ? "#b91c1c" : "#166534";
  const statusText = isSuspended ? "Account Suspended" : "Account Reinstated";

  const mailOptions = {
    from: `"WasteZero Support" <${process.env.EMAIL_USER}>`,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial; padding:20px; background:#f8fafc;">
        <div style="background:white; padding:22px; border-radius:10px; max-width:620px; margin:0 auto; border-left:5px solid ${statusColor};">
          <h2 style="color:${statusColor}; margin:0 0 12px 0;">${statusText}</h2>
          <p style="margin:0 0 10px 0; color:#374151;">Hello ${name || "User"},</p>

          ${
            isSuspended
              ? `<p style="margin:0 0 10px 0; color:#374151;">Your WasteZero account has been suspended by the admin team.</p>
                 <div style="background:#fef2f2; padding:12px; border-radius:8px; margin:12px 0;">
                   <p style="margin:0; color:#7f1d1d;"><strong>Reason:</strong> ${reason || "No reason provided."}</p>
                 </div>
                 <p style="margin:0; color:#4b5563;">If you believe this was a mistake, please contact support.</p>`
              : `<p style="margin:0 0 10px 0; color:#374151;">Your WasteZero account has been reactivated. You can now log in and continue using the platform.</p>`
          }
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
