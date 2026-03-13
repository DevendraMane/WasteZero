import User from "../models/user-model.js";
import crypto from "crypto";
import {
  sendAdminCodeMismatchAlertEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
} from "../utils/sendEmail.js";
import logger from "../utils/logger.js";

// ================= REGISTER =================
const register = async (req, res) => {
  try {
    const { name, email, password, role, adminCode } = req.body;

    // 🔒 Validate required fields
    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // 🔒 Validate role - allow admin if correct code provided
    let finalRole = role;
    const allowedRoles = ["volunteer", "ngo"];

    if (role === "admin") {
      const secretAdminCode = process.env.ADMIN_SECRET_CODE;

      if (!secretAdminCode) {
        logger.error("[REGISTER] ADMIN_SECRET_CODE is not configured");
        return res.status(500).json({
          message: "Server misconfigured. Admin registration unavailable.",
        });
      }

      if (!adminCode || adminCode !== secretAdminCode) {
        try {
          const admins = await User.find({ role: "admin" }).select("email");
          const adminEmails = admins
            .map((admin) => admin.email)
            .filter(Boolean);

          // Fallback to EMAIL_USER if no admin exists yet.
          const recipients =
            adminEmails.length > 0
              ? adminEmails
              : [process.env.EMAIL_USER].filter(Boolean);

          const forwardedIp = req.headers["x-forwarded-for"];
          const clientIp = Array.isArray(forwardedIp)
            ? forwardedIp[0]
            : forwardedIp?.split(",")[0]?.trim() || req.ip;

          const attemptData = {
            attemptedName: name,
            attemptedEmail: email,
            attemptedRole: role,
            ipAddress: clientIp,
            userAgent: req.get("user-agent"),
            attemptedAt: new Date().toLocaleString(),
          };

          await Promise.all(
            recipients.map((recipient) =>
              sendAdminCodeMismatchAlertEmail(recipient, attemptData),
            ),
          );
        } catch (mailError) {
          logger.error(
            "[REGISTER] Failed to send invalid admin code alert email",
            mailError,
          );
        }

        return res.status(403).json({
          message: "Invalid admin code. Cannot create admin user.",
        });
      }
      finalRole = "admin";
    } else if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        message: "Invalid role selected",
      });
    }

    // 🔒 Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    // 🔒 Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message:
          "Email already registered. Please login or use a different email.",
      });
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      name,
      email,
      password,
      role: finalRole,
      verificationToken,
      isVerified: finalRole === "admin" ? true : false, // Auto-verify admins
      isOnline: false,
      lastSeen: new Date(),
    });

    await newUser.save();
    logger.log(`[REGISTER] New user created: ${email} (${finalRole})`);

    // Send verification email only for non-admin users
    if (finalRole !== "admin") {
      try {
        await sendVerificationEmail(email, verificationToken);
        logger.log(`[REGISTER] Verification email sent to: ${email}`);
      } catch (emailError) {
        logger.error(
          `[REGISTER] Email sending failed for ${email}:`,
          emailError.message,
        );
        // Don't block registration if email fails - user can request resend
      }

      res.status(201).json({
        message:
          "Registration successful! Please check your email to verify your account.",
        email,
        role: finalRole,
      });
    } else {
      // Admin user - auto-verified, can login immediately
      res.status(201).json({
        message: "Admin account created successfully! You can now login.",
        email,
        role: "admin",
        isVerified: true,
      });
    }
  } catch (error) {
    logger.error("[REGISTER ERROR]:", error);
    res.status(500).json({
      message: error.message || "Registration failed. Please try again.",
    });
  }
};

// ================= VERIFY EMAIL =================
const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    user.isVerified = true;
    user.verificationToken = undefined;

    await user.save();

    res.send("Email verified successfully. You can login now.");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// ================= GET PROFILE =================
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= UPDATE PROFILE =================
export const updateProfile = async (req, res) => {
  try {
    const userId = req.userId;

    const { name, location, address, skills, bio, latitude, longitude } =
      req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, location, address, skills, bio, latitude, longitude },
      { new: true },
    ).select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= CHANGE PASSWORD =================
export const changePassword = async (req, res) => {
  try {
    const userId = req.userId;
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({
        message: "Current password is incorrect",
      });
    }

    user.password = newPassword;
    await user.save();

    res.status(200).json({
      message: "Password changed successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= LOGIN =================
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User not found",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid credentials",
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify your email first",
      });
    }

    // 🔥 OPTIONAL: Block suspended users
    if (user.isSuspended) {
      return res.status(403).json({
        message: "Your account has been suspended by admin",
      });
    }

    const token = user.generateToken();

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= FORGOT PASSWORD =================
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    // Always send same response (security best practice)
    if (!user) {
      return res.status(200).json({
        message: "If this email exists, a reset link has been sent",
      });
    }

    // Generate token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // Hash token before saving (security)
    const hashedToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 mins

    await user.save();

    // Create reset URL
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;

    // Send Email (reuse your email util)

    await sendResetPasswordEmail(email, resetUrl);

    res.status(200).json({
      message: "If this email exists, a reset link has been sent",
    });
  } catch (error) {
    logger.error("FORGOT PASSWORD ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Token invalid or expired",
      });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    res.status(200).json({
      message: "Password reset successful",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= GET USER PREFERENCES =================
export const getUserPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.log("[GET PREFERENCES] userId:", userId);

    const user = await User.findById(userId).select("notifications darkMode");

    if (!user) {
      logger.error("[GET PREFERENCES] User not found:", userId);
      return res.status(404).json({
        message: "User not found",
      });
    }

    const response = {
      notifications: user.notifications || { email: true },
      darkMode: user.darkMode || false,
    };

    logger.log("[GET PREFERENCES] Returning:", response);
    res.status(200).json(response);
  } catch (error) {
    logger.error("[GET PREFERENCES ERROR]:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

// ================= UPDATE USER PREFERENCES =================
export const updateUserPreferences = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notifications, darkMode } = req.body;

    logger.log("[UPDATE PREFERENCES] userId:", userId, "body:", {
      notifications,
      darkMode,
    });

    const updateData = {};

    if (notifications) {
      updateData.notifications = notifications;
    }

    if (darkMode !== undefined) {
      updateData.darkMode = darkMode;
    }

    logger.log("[UPDATE PREFERENCES] updateData:", updateData);

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("notifications darkMode");

    if (!updatedUser) {
      logger.error("[UPDATE PREFERENCES] User not found:", userId);
      return res.status(404).json({
        message: "User not found",
      });
    }

    const response = {
      message: "Preferences updated successfully",
      notifications: updatedUser.notifications,
      darkMode: updatedUser.darkMode,
    };

    logger.log("[UPDATE PREFERENCES] Success:", response);
    res.status(200).json(response);
  } catch (error) {
    logger.error("[UPDATE PREFERENCES ERROR]:", error);
    res.status(500).json({
      message: "Server error: " + error.message,
    });
  }
};

// ================= DELETE ACCOUNT =================
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    logger.log("[DELETE ACCOUNT] Attempting to delete user:", userId);

    const user = await User.findById(userId);

    if (!user) {
      logger.error("[DELETE ACCOUNT] User not found:", userId);
      return res.status(404).json({
        message: "User not found",
      });
    }

    // Admin users cannot delete their own account via this endpoint
    if (user.role === "admin") {
      return res.status(403).json({
        message: "Admin accounts cannot be deleted through this endpoint",
      });
    }

    // Delete user account
    await User.findByIdAndDelete(userId);

    logger.log(`[DELETE ACCOUNT] User account deleted: ${user.email}`);

    res.status(200).json({
      message: "Account deleted successfully",
    });
  } catch (error) {
    logger.error("[DELETE ACCOUNT ERROR]:", error);
    res.status(500).json({
      message: "Server error: " + error.message,
    });
  }
};

const googleCallback = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
          "Authentication failed",
        )}`,
      );
    }

    // 🔴 BLOCK suspended users
    if (user.isSuspended) {
      return res.redirect(
        `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
          "Account suspended by admin",
        )}`,
      );
    }

    // Generate token
    const token = user.generateToken();

    if (!token) {
      return res.redirect(
        `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
          "Failed to generate authentication token",
        )}`,
      );
    }

    // Update last login
    await user.constructor.updateOne(
      { _id: user._id },
      { lastSeen: new Date() },
    );

    res.redirect(`${process.env.CLIENT_URL}/oauth-success?token=${token}`);
  } catch (error) {
    logger.error("[GOOGLE CALLBACK ERROR]:", error);
    res.redirect(
      `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
        error.message || "Google authentication failed",
      )}`,
    );
  }
};

export default {
  register,
  login,
  verifyEmail,
  updateProfile,
  changePassword,
  getProfile,
  forgotPassword,
  resetPassword,
  googleCallback,
  getUserPreferences,
  updateUserPreferences,
  deleteAccount,
};
