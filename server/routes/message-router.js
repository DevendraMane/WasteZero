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

// Flag/Report user endpoints
router.post("/flag/report", authMiddleware, messageController.flagUser);

router.post("/flag/unreport", authMiddleware, messageController.unflagUser);

// Block/Unblock user endpoints
router.post("/block", authMiddleware, messageController.blockUser);

router.post("/unblock", authMiddleware, messageController.unblockUser);

router.get("/blocked/list", authMiddleware, messageController.getBlockedUsers);

// Delete conversation endpoint
router.post(
  "/delete-conversation",
  authMiddleware,
  messageController.deleteConversation,
);

export default router;
