import nodemailer from "nodemailer";

export const sendVerificationEmail = async (email, token) => {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const verifyURL = `http://localhost:5000/api/auth/verify/${token}`;

  const mailOptions = {
    from: `"WasteZero" <${process.env.EMAIL_USER}>`,
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
