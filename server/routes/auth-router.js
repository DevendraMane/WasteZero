import express from "express";
import authcontrollers, {
  updateProfile,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";
import passport from "passport";
export const authRouter = express.Router();

// ******  REGISTRATION ROUTE  ****** //
authRouter.route("/register").post(authcontrollers.register);

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

// ================= GOOGLE AUTH =================

// Step 1: Redirect to Google
authRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] }),
);

// Step 2: Google Callback
authRouter.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=User already exists`,
  }),
  authcontrollers.googleCallback,
);
