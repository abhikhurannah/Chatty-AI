import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta';
    this.model = process.env.AI_MODEL || 'gemini-2.5-flash-preview-05-20';
    this.maxTokens = parseInt(process.env.AI_MAX_TOKENS) || 600;

    console.log(`🤖 AI Service initialized (Gemini)`);
    console.log(`   Model: ${this.model}`);
    console.log(`   API Key: ${this.apiKey ? '✅ Set' : '❌ Missing – set GEMINI_API_KEY in .env'}`);

    this.testConnection();
  }

  getToneInstructions(tone = 'casual') {
    const toneMap = {
      casual:       'Reply in a relaxed, informal, friendly manner. Use everyday language and contractions.',
      professional: 'Reply in a polished, business-appropriate manner. Be clear, concise, and respectful.',
      flirty:       'Reply in a playful, charming, subtly romantic manner. Be fun but tasteful.',
      friendly:     'Reply in a warm, approachable, and supportive manner. Be kind and engaging.',
      formal:       'Reply in a respectful, structured, and proper manner. Use complete sentences and formal language.',
      humorous:     'Reply in a witty, entertaining, and light-hearted manner. Include appropriate humor.',
    };
    return toneMap[tone] || toneMap.casual;
  }

  getToneTemperature(tone) {
    const tempMap = {
      casual: 0.8,
      professional: 0.5,
      flirty: 0.9,
      friendly: 0.7,
      formal: 0.4,
      humorous: 0.9,
    };
    return tempMap[tone] || 0.7;
  }

  /**
   * Build a labeled conversation history string so the AI knows who said what.
   * e.g.  "Alice: Hey!\nYou: Hi there!\nAlice: What are you up to?"
   */
  buildLabeledHistory(messages, currentUserId, otherUserName = 'Them') {
    if (!messages || messages.length === 0) return '';
    return messages
      .slice(-15)
      .map(msg => {
        const isMe = String(msg.senderId) === String(currentUserId);
        const text = msg.text || '[image]';
        return `${isMe ? 'You' : otherUserName}: ${text}`;
      })
      .join('\n');
  }

  /**
   * Core Gemini call – returns raw text
   */
  async callGemini(prompt, temperature = 0.8) {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY not set');

    const response = await axios.post(
      `${this.apiUrl}/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature,
          maxOutputTokens: this.maxTokens,
          topP: 0.95,
          topK: 64,
        },
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 25000,
      }
    );

    const candidate = response.data.candidates?.[0];
    if (!candidate?.content?.parts?.[0]?.text) {
      throw new Error('Empty Gemini response');
    }
    return candidate.content.parts[0].text.trim();
  }

  /**
   * Parse a JSON array from Gemini output (strips markdown fences if present)
   */
  parseJsonArray(raw) {
    // Strip ```json ... ``` fences
    const clean = raw.replace(/```json\s*/gi, '').replace(/```/g, '').trim();
    const match = clean.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('No JSON array found in response');
    return JSON.parse(match[0]);
  }

  // ─────────────────────────────────────────────────────────────
  //  Reply suggestions  (Bot button)
  // ─────────────────────────────────────────────────────────────
  async generateReplySuggestions(conversationHistory, currentMessage, options = {}) {
    const tone = options.tone || 'casual';
    const currentUserId = options.userId;
    const otherUserName = options.otherUserName || 'Them';

    try {
      const toneInstr = this.getToneInstructions(tone);
      const historyText = this.buildLabeledHistory(conversationHistory, currentUserId, otherUserName);

      const prompt = [
        `You are a messaging assistant. ${toneInstr}`,
        historyText ? `Recent conversation:\n${historyText}` : '',
        `\nLatest message to reply to: "${currentMessage}"`,
        `\nGenerate exactly 3 diverse, natural reply options in a ${tone} tone.`,
        `Return ONLY a JSON array of 3 strings, no markdown, no extra text.`,
        `Example: ["Reply one", "Reply two", "Reply three"]`,
      ].filter(Boolean).join('\n');

      const raw = await this.callGemini(prompt, this.getToneTemperature(tone));
      const suggestions = this.parseJsonArray(raw);

      return suggestions.slice(0, 3).map((s, i) => ({
        suggestion: String(s),
        confidence: parseFloat((0.9 - i * 0.05).toFixed(2)),
        tone,
      }));
    } catch (error) {
      console.error('❌ generateReplySuggestions error:', error.message);
      return this.getFallbackSuggestions(currentMessage, tone);
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Typing autocomplete suggestions
  // ─────────────────────────────────────────────────────────────
  async generateTypingSuggestions(partialText, conversationHistory, options = {}) {
    const tone = options.tone || 'casual';
    const currentUserId = options.userId;
    const otherUserName = options.otherUserName || 'Them';

    try {
      const toneInstr = this.getToneInstructions(tone);
      const historyText = this.buildLabeledHistory(conversationHistory, currentUserId, otherUserName);

      const prompt = [
        `You complete partial chat messages. ${toneInstr}`,
        historyText ? `Conversation context:\n${historyText}` : '',
        `\nComplete this partial message in 3 natural ways: "${partialText}"`,
        `Return ONLY a JSON array of 3 full completed messages, no markdown.`,
        `Example: ["Full message one", "Full message two", "Full message three"]`,
      ].filter(Boolean).join('\n');

      const raw = await this.callGemini(prompt, this.getToneTemperature(tone));
      const suggestions = this.parseJsonArray(raw);

      return suggestions.slice(0, 3).map(s => ({
        suggestion: String(s),
        confidence: 0.8,
        tone,
      }));
    } catch (error) {
      console.error('❌ generateTypingSuggestions error:', error.message);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Chatbot (ChatbotDialog)
  // ─────────────────────────────────────────────────────────────
  async generateChatbotResponse(chatHistory, userMessage, tone = 'casual') {
    try {
      const toneInstr = this.getToneInstructions(tone);

      // Build a single text prompt with full history
      let prompt = `You are a friendly, helpful AI assistant embedded in a chat app.\n${toneInstr}\nBe concise and conversational.\n\n`;

      if (chatHistory && chatHistory.length > 0) {
        chatHistory.slice(-10).forEach(msg => {
          prompt += `${msg.role === 'assistant' ? 'Assistant' : 'User'}: ${msg.content}\n`;
        });
      }
      prompt += `User: ${userMessage}\nAssistant:`;

      const response = await this.callGemini(prompt, this.getToneTemperature(tone));
      return response;
    } catch (error) {
      console.error('❌ generateChatbotResponse error:', error.message);
      return "I'm having trouble right now. Could you try again?";
    }
  }

  // ─────────────────────────────────────────────────────────────
  //  Conversation analysis (AIAnalysis panel)
  // ─────────────────────────────────────────────────────────────
  async analyzeConversation(messages) {
    if (!messages || messages.length === 0) return this.getDefaultAnalysis();

    try {
      const messageTexts = messages
        .filter(m => m.text)
        .slice(-20)
        .map(m => m.text)
        .join('\n');

      const prompt = [
        'You are a conversation analyst. Return ONLY valid JSON, no markdown.',
        `Analyze this conversation:\n${messageTexts}`,
        `Return JSON with exactly these keys:`,
        `{`,
        `  "sentiment": "positive|negative|neutral",`,
        `  "tone": "casual|friendly|professional|formal",`,
        `  "topics": ["topic1","topic2","topic3"],`,
        `  "suggestions": ["suggestion1","suggestion2","suggestion3"],`,
        `  "conversationStyle": "engaging|brief|detailed|mixed",`,
        `  "emotionalTone": "warm|neutral|tense|playful"`,
        `}`,
      ].join('\n');

      const raw = await this.callGemini(prompt, 0.3);
      const jsonMatch = raw.replace(/```json\s*/gi, '').replace(/```/g, '').match(/\{[\s\S]*\}/);
      if (!jsonMatch) return this.getDefaultAnalysis();
      return JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error('❌ analyzeConversation error:', error.message);
      return this.getDefaultAnalysis();
    }
  }

  getDefaultAnalysis() {
    return {
      sentiment: 'neutral',
      tone: 'casual',
      topics: ['general conversation', 'daily chat'],
      suggestions: [
        'Ask open-ended questions to keep the conversation going',
        'Share your own experiences and thoughts',
        'Show genuine interest in what they are saying',
      ],
      conversationStyle: 'natural',
      emotionalTone: 'neutral',
    };
  }

  getFallbackSuggestions(message = '', tone = 'casual') {
    const fallbacks = {
      casual:       [
        { suggestion: "That's interesting! Tell me more.", confidence: 0.7, tone },
        { suggestion: "Got it, thanks for sharing!", confidence: 0.65, tone },
        { suggestion: "Cool! What else is up?", confidence: 0.6, tone },
      ],
      professional: [
        { suggestion: "Thank you for the information.", confidence: 0.7, tone },
        { suggestion: "I appreciate you sharing that.", confidence: 0.65, tone },
        { suggestion: "That's helpful to know.", confidence: 0.6, tone },
      ],
      flirty: [
        { suggestion: "That's so interesting... tell me more 😊", confidence: 0.7, tone },
        { suggestion: "I love hearing about this from you!", confidence: 0.65, tone },
        { suggestion: "You always have the best stories 😉", confidence: 0.6, tone },
      ],
      friendly: [
        { suggestion: "That sounds wonderful! Thanks for sharing!", confidence: 0.7, tone },
        { suggestion: "I'm so glad you told me about this!", confidence: 0.65, tone },
        { suggestion: "That's really nice to hear!", confidence: 0.6, tone },
      ],
      formal: [
        { suggestion: "I acknowledge your message.", confidence: 0.7, tone },
        { suggestion: "Thank you for bringing this to my attention.", confidence: 0.65, tone },
        { suggestion: "I understand and appreciate your input.", confidence: 0.6, tone },
      ],
      humorous: [
        { suggestion: "Ha! That's hilarious! What happened next? 😄", confidence: 0.7, tone },
        { suggestion: "You're killing me! Tell me more!", confidence: 0.65, tone },
        { suggestion: "That's comedy gold right there! 🎭", confidence: 0.6, tone },
      ],
    };
    return fallbacks[tone] || fallbacks.casual;
  }

  isAvailable() {
    return !!this.apiKey;
  }

  async testConnection() {
    if (!this.apiKey) {
      console.log('⚠️  GEMINI_API_KEY not set – AI features will use fallback suggestions');
      return;
    }
    try {
      await this.callGemini('Reply with just the word: OK', 0.1);
      console.log(`✅ Gemini connected (${this.model})`);
    } catch (error) {
      console.log('⚠️  Gemini connection test failed:', error.response?.data?.error?.message || error.message);
    }
  }
}

const aiService = new AIService();
export default aiService;
