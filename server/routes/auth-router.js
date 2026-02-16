import express from "express";
import authcontrollers from "../controllers/auth-controller.js";

export const authRouter = express.Router();

// ******  REGISTRATION ROUTE  ****** //
authRouter.route("/register").post(authcontrollers.register);

// ******  LOGIN ROUTE  ****** //
authRouter.route("/login").post(authcontrollers.login);
