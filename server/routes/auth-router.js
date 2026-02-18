import express from "express";
import authcontrollers, {
  updateProfile,
} from "../controllers/auth-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

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

authRouter.get("/profile", authMiddleware, authcontrollers.getProfile);
