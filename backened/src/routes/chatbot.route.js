import express from "express";
import { protectRoute } from "../middlewares/auth.middleware.js";
import {
  getReplySuggestions,
  getTypingSuggestions,
  chatWithBot,
  analyzeConversation,
  getAIStatus
} from "../controllers/chatbot.controller.js";

const router = express.Router();

// Get AI service status
router.get("/status", getAIStatus);

// Get AI-powered reply suggestions (with context and tone support)
router.post("/suggestions/reply", protectRoute, getReplySuggestions);

// Get suggestions while user is typing (auto-complete)
router.post("/suggestions/typing", protectRoute, getTypingSuggestions);

// Direct chatbot conversation (with tone support)
router.post("/chat", protectRoute, chatWithBot);

// Analyze conversation sentiment and topics (changed from GET to POST)
router.post("/analyze/:receiverId", protectRoute, analyzeConversation);

export default router;