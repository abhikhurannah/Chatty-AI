import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import aiService from "../lib/ai.js";

/**
 * Get AI-powered reply suggestions with full conversation context and tone
 */
export const getReplySuggestions = async (req, res) => {
  try {
    const { messageId, receiverId, tone, context } = req.body;
    const userId = req.user._id;

    if (!receiverId) {
      return res.status(400).json({ message: "receiverId is required" });
    }

    if (!aiService.isAvailable()) {
      return res.status(200).json({
        suggestions: aiService.getFallbackSuggestions('', tone || 'casual'),
        fallback: true,
      });
    }

    // Fetch the other user's name for labeled context
    const otherUser = await User.findById(receiverId).select('fullname').lean();
    const otherUserName = otherUser?.fullname?.split(' ')[0] || 'Them';

    // Fetch full conversation history (both directions)
    const conversationHistory = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(30)
      .lean();

    // Determine the message to respond to
    let targetMessage = null;
    if (messageId && messageId !== 'latest') {
      targetMessage = await Message.findById(messageId).lean();
    }

    const messageText =
      targetMessage?.text ||
      (conversationHistory.length > 0
        ? conversationHistory[conversationHistory.length - 1].text
        : '') ||
      'Hello!';

    const suggestions = await aiService.generateReplySuggestions(
      conversationHistory,
      messageText,
      {
        userId: userId.toString(),
        tone: tone || 'casual',
        otherUserName,
      }
    );

    res.status(200).json({
      suggestions,
      tone: tone || 'casual',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ getReplySuggestions error:", error.message);
    res.status(500).json({
      message: "Failed to generate suggestions",
      suggestions: aiService.getFallbackSuggestions('', req.body.tone || 'casual'),
    });
  }
};

/**
 * Generate contextual typing autocomplete suggestions
 */
export const getTypingSuggestions = async (req, res) => {
  try {
    const { partialText, receiverId, tone, context } = req.body;
    const userId = req.user._id;

    if (!partialText || partialText.trim().length < 2) {
      return res.status(200).json({ suggestions: [] });
    }

    if (!aiService.isAvailable()) {
      return res.status(200).json({ suggestions: [] });
    }

    // Fetch recent conversation for context
    const conversationHistory = await Message.find({
      $or: [
        { senderId: userId, receiverId },
        { senderId: receiverId, receiverId: userId },
      ],
    })
      .sort({ createdAt: 1 })
      .limit(10)
      .lean();

    const otherUser = receiverId
      ? await User.findById(receiverId).select('fullname').lean()
      : null;
    const otherUserName = otherUser?.fullname?.split(' ')[0] || 'Them';

    const suggestions = await aiService.generateTypingSuggestions(
      partialText,
      conversationHistory,
      {
        userId: userId.toString(),
        tone: tone || 'casual',
        otherUserName,
      }
    );

    res.status(200).json({
      suggestions,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ getTypingSuggestions error:", error.message);
    res.status(200).json({ suggestions: [] });
  }
};

/**
 * Direct chatbot conversation with tone and history
 */
export const chatWithBot = async (req, res) => {
  try {
    const { message, tone, chatHistory } = req.body;

    if (!message?.trim()) {
      return res.status(400).json({ message: "message is required" });
    }

    if (!aiService.isAvailable()) {
      return res.status(200).json({
        response: "AI service is not configured. Please set ANTHROPIC_API_KEY.",
      });
    }

    const response = await aiService.generateChatbotResponse(
      chatHistory || [],
      message,
      tone || 'casual'
    );

    res.status(200).json({
      response,
      tone: tone || 'casual',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ chatWithBot error:", error.message);
    res.status(500).json({
      message: "Failed to generate response",
      response: "I'm having trouble responding right now. Please try again.",
    });
  }
};

/**
 * Analyze conversation sentiment and topics
 */
export const analyzeConversation = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const { messages: providedMessages } = req.body;
    const userId = req.user._id;

    let messages;
    if (providedMessages && providedMessages.length > 0) {
      messages = providedMessages;
    } else {
      messages = await Message.find({
        $or: [
          { senderId: userId, receiverId },
          { senderId: receiverId, receiverId: userId },
        ],
      })
        .sort({ createdAt: 1 })
        .limit(50)
        .lean();
    }

    if (messages.length === 0) {
      return res.status(200).json({
        sentiment: 'neutral',
        tone: 'casual',
        topics: [],
        suggestions: [
          'Start by introducing yourself',
          'Ask an open-ended question',
          'Share something interesting',
        ],
        messageCount: 0,
      });
    }

    let analysis;
    if (aiService.isAvailable()) {
      analysis = await aiService.analyzeConversation(messages);
    } else {
      analysis = performBasicAnalysis(messages);
    }

    analysis.messageCount = messages.length;
    analysis.timestamp = new Date().toISOString();

    res.status(200).json(analysis);
  } catch (error) {
    console.error("❌ analyzeConversation error:", error.message);
    res.status(500).json({ message: "Failed to analyze conversation" });
  }
};

function performBasicAnalysis(messages) {
  const positiveWords = ['love','great','awesome','good','happy','thanks','wonderful','nice','amazing','perfect'];
  const negativeWords = ['bad','hate','sad','angry','terrible','awful','horrible','disappointed','sorry','upset'];

  let positiveCount = 0, negativeCount = 0;
  const topicWords = {};

  messages.forEach(msg => {
    if (!msg.text) return;
    const text = msg.text.toLowerCase();
    positiveWords.forEach(w => { if (text.includes(w)) positiveCount++; });
    negativeWords.forEach(w => { if (text.includes(w)) negativeCount++; });
    text.split(/\s+/).forEach(word => {
      const cleaned = word.replace(/[^a-z]/g, '');
      if (cleaned.length > 5) topicWords[cleaned] = (topicWords[cleaned] || 0) + 1;
    });
  });

  const sentiment = positiveCount > negativeCount * 2 ? 'positive'
    : negativeCount > positiveCount * 2 ? 'negative' : 'neutral';

  const avgLength = messages.reduce((s, m) => s + (m.text?.length || 0), 0) / messages.length;
  const tone = avgLength > 100 ? 'formal' : positiveCount > 5 ? 'friendly' : 'casual';

  const topics = Object.entries(topicWords)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([w]) => w);

  return {
    sentiment, tone, topics,
    suggestions: [
      'Keep the conversation balanced with questions and statements',
      'Show genuine interest in what they share',
      'Be responsive and engaged',
    ],
    conversationStyle: avgLength > 80 ? 'detailed' : 'brief',
    emotionalTone: sentiment === 'positive' ? 'warm' : sentiment === 'negative' ? 'concerned' : 'neutral',
  };
}

export const getAIStatus = async (req, res) => {
  res.status(200).json({
    available: aiService.isAvailable(),
    provider: 'anthropic',
    model: aiService.model,
    timestamp: new Date().toISOString(),
  });
};
