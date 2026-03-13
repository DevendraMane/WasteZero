import express from "express";
import authcontrollers, {
  updateProfile,
  getUserPreferences,
  updateUserPreferences,
  deleteAccount,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import { checkFeatureToggle } from "../middlewares/settings-middleware.js";
import passport from "passport";
import logger from "../utils/logger.js";
export const authRouter = express.Router();

// ******  REGISTRATION ROUTE  ****** //
authRouter
  .route("/register")
  .post(checkFeatureToggle("allowRegistrations"), authcontrollers.register);

// ******  LOGIN ROUTE  ****** //
authRouter.route("/login").post(authcontrollers.login);

authRouter.get("/verify/:token", authcontrollers.verifyEmail);

authRouter.put(
  "/update-profile",
  authMiddleware,
  authcontrollers.updateProfile,
);

authRouter.put(
  "/change-password",
  authMiddleware,
  authcontrollers.changePassword,
);

authRouter.post("/forgot-password", authcontrollers.forgotPassword);

authRouter.put("/reset-password/:token", authcontrollers.resetPassword);

authRouter.get("/profile", authMiddleware, authcontrollers.getProfile);

authRouter
  .route("/user/preferences")
  .get(authMiddleware, getUserPreferences)
  .put(authMiddleware, updateUserPreferences);

authRouter.delete("/user/delete-account", authMiddleware, deleteAccount);

// ================= GOOGLE AUTH =================

// Step 1: Redirect to Google
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Step 2: Google Callback with custom callback for better error handling
authRouter.get("/google/callback", (req, res, next) => {
  passport.authenticate("google", { session: false }, (err, user, info) => {
    try {
      if (err) {
        logger.error("[PASSPORT ERROR]", err);
        return res.redirect(
          `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
            err.message || "Authentication error",
          )}`,
        );
      }

      // Passport returned false with info (authentication failed)
      if (!user) {
        logger.warn("[PASSPORT] Authentication failed", {
          message: info?.message || "No failure reason provided",
        });
        const errorMessage = info?.message || "Google authentication failed";
        return res.redirect(
          `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
            errorMessage,
          )}`,
        );
      }

      // Attach user to request for googleCallback
      req.user = user;
      authcontrollers.googleCallback(req, res);
    } catch (error) {
      logger.error("[Google Callback Error]", error);
      res.redirect(
        `${process.env.CLIENT_URL}/oauth-failed?message=${encodeURIComponent(
          error.message || "An unexpected error occurred",
        )}`,
      );
    }
  })(req, res, next);
});
