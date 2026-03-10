import express from "express";
import messageController from "../controllers/message-controller.js";
import { authMiddleware } from "../middlewares/auth-middleware.js";

const router = express.Router();

router.get(
  "/conversations",
  authMiddleware,
  messageController.getConversations,
);

router.get("/:userId", authMiddleware, messageController.getMessages);

router.post("/", authMiddleware, messageController.sendMessage);

export default router;
