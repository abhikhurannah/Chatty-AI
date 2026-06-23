import { Server } from "socket.io";
import http from "http";
import express from "express";
import aiService from "./ai.js";
import Message from "../models/message.model.js";
import User from "../models/user.model.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "https://automated-chat-app.vercel.app",
    ],
  },
});

export function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  if (userId) userSocketMap[userId] = socket.id;
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  /**
   * Request AI reply suggestions (real-time via socket)
   * Expects: { messageId, receiverId, tone, conversationHistory }
   */
  socket.on("requestReplySuggestions", async (data) => {
    try {
      const { messageId, receiverId, tone = 'casual', conversationHistory } = data;

      if (!aiService.isAvailable()) {
        socket.emit("replySuggestions", {
          suggestions: aiService.getFallbackSuggestions('', tone),
          messageId,
        });
        return;
      }

      const otherUser = await User.findById(receiverId).select('fullname').lean();
      const otherUserName = otherUser?.fullname?.split(' ')[0] || 'Them';

      // Fetch DB history if not supplied
      let history = conversationHistory;
      if (!history || history.length === 0) {
        history = await Message.find({
          $or: [
            { senderId: userId, receiverId },
            { senderId: receiverId, receiverId: userId },
          ],
        })
          .sort({ createdAt: 1 })
          .limit(20)
          .lean();
      }

      const targetMessage = messageId ? await Message.findById(messageId).lean() : null;
      const messageText = targetMessage?.text ||
        (history.length > 0 ? history[history.length - 1].text : 'Hello!');

      const suggestions = await aiService.generateReplySuggestions(
        history,
        messageText,
        { userId, tone, otherUserName }
      );

      socket.emit("replySuggestions", {
        suggestions,
        messageId,
        tone,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Socket reply suggestions error:", error);
      socket.emit("replySuggestionsError", { error: "Failed to generate suggestions" });
    }
  });

  /**
   * Real-time typing suggestions
   * Expects: { partialText, receiverId, tone }
   */
  socket.on("requestTypingSuggestions", async (data) => {
    try {
      const { partialText, receiverId, tone = 'casual' } = data;

      if (!aiService.isAvailable() || !partialText || partialText.length < 3) {
        socket.emit("typingSuggestions", { suggestions: [] });
        return;
      }

      const history = await Message.find({
        $or: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      })
        .sort({ createdAt: 1 })
        .limit(10)
        .lean();

      const otherUser = await User.findById(receiverId).select('fullname').lean();
      const otherUserName = otherUser?.fullname?.split(' ')[0] || 'Them';

      const suggestions = await aiService.generateTypingSuggestions(
        partialText,
        history,
        { userId, tone, otherUserName }
      );

      socket.emit("typingSuggestions", {
        suggestions,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Socket typing suggestions error:", error);
      socket.emit("typingSuggestions", { suggestions: [] });
    }
  });

  socket.on("disconnect", () => {
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
