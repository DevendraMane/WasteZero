import express from "express";
import multer from "multer";
import imageController from "../controllers/image-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

/* ================= MULTER CONFIG ================= */
const storage = multer.memoryStorage();

const upload = multer({ storage });

/* ================= ROUTES ================= */

router.post(
  "/upload-profile-image",
  authMiddleware,
  upload.single("profileImage"),
  imageController.uploadProfileImage,
);

export default router;
