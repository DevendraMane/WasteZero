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
