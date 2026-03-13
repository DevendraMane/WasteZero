import nodemailer from "nodemailer";

// ================= CREATE TRANSPORTER =================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= EMAIL VERIFICATION =================
export const sendVerificationEmail = async (email, token) => {
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

  await transporter.sendMail(mailOptions);
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
