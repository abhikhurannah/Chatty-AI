# Chatty AI - Backend Server

## 📋 Overview

This is the backend server for Chatty AI, a real-time messaging application with AI-powered features. Built with Node.js, Express, Socket.IO, and integrated with Google Gemini AI for intelligent message suggestions and conversation analysis.

## 🚀 Features

### Core Functionality
- ✅ **RESTful API** - Clean, organized endpoints
- ✅ **Real-time Messaging** - Socket.IO for instant communication
- ✅ **User Authentication** - JWT-based secure authentication
- ✅ **Image Upload** - Cloudinary integration for media storage
- ✅ **MongoDB Database** - Mongoose ODM for data management

### AI Features (Powered by Google Gemini)
- 🤖 **Smart Reply Suggestions** - Context-aware message suggestions
- 💬 **AI Chatbot** - Interactive AI assistant with personality tones
- 📊 **Conversation Analysis** - Sentiment and topic detection
- 🎭 **Tone System** - 6 different AI personalities
- ⚡ **Real-time Processing** - Fast AI responses

## 🛠️ Tech Stack

- **Runtime**: Node.js v18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Real-time**: Socket.IO
- **AI Provider**: Google Gemini API
- **Authentication**: JWT + bcrypt
- **File Storage**: Cloudinary
- **Environment**: dotenv

## 📦 Installation

### Prerequisites
- Node.js v18 or higher
- MongoDB (local or Atlas)
- Google Gemini API key

### Setup Steps

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` file with your credentials**
   ```env
   # Server Configuration
   PORT=5001
   NODE_ENV=development

   # Database
   MONGODB_URI=mongodb://localhost:27017/chatty
   # OR use MongoDB Atlas
   # MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/chatty

   # Authentication
   JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters

   # Cloudinary (Image Upload)
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret

   # AI Configuration - Google Gemini
   GEMINI_API_KEY=your-gemini-api-key-here
   AI_PROVIDER=gemini
   AI_MODEL=gemini-2.0-flash
   AI_MAX_TOKENS=500
   AI_TEMPERATURE=0.7
   ```

4. **Start the server**
   ```bash
   # Development mode (with auto-restart)
   npm run dev

   # Production mode
   npm start
   ```

## 🔑 Getting API Keys

### Google Gemini API Key
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the key and add to `.env` as `GEMINI_API_KEY`

### MongoDB Atlas (Free Cloud Database)
1. Sign up at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free M0 cluster
3. Get connection string
4. Add to `.env` as `MONGODB_URI`

### Cloudinary (Free Image Storage)
1. Sign up at [Cloudinary](https://cloudinary.com/)
2. Get credentials from dashboard
3. Add to `.env` file

## 📡 API Endpoints

### Authentication
```
POST   /api/auth/signup          - Register new user
POST   /api/auth/login           - User login
POST   /api/auth/logout          - User logout
PUT    /api/auth/update-profile  - Update user profile
GET    /api/auth/check           - Check authentication status
```

### Messaging
```
GET    /api/messages/users       - Get all users
GET    /api/messages/:id         - Get messages with specific user
POST   /api/messages/send/:id    - Send message to user
```

### AI Features (Gemini-powered)
```
GET    /api/chatbot/status                  - Check AI service status
POST   /api/chatbot/suggestions/reply      - Get reply suggestions
POST   /api/chatbot/suggestions/typing     - Get typing completions
POST   /api/chatbot/chat                   - Chat with AI bot
POST   /api/chatbot/analyze/:receiverId    - Analyze conversation
```

### Health Check
```
GET    /health                   - Server health status
```

## 🤖 AI Configuration

### Available Models

The backend uses **Google Gemini 2.0 Flash** by default, which provides:
- ⚡ Fast response times
- 🎯 High-quality suggestions
- 💬 Natural conversation flow
- 📊 Accurate analysis

### Supported Gemini Models
```
gemini-2.0-flash       - Fast, balanced (Recommended)
gemini-2.5-flash       - Latest version, enhanced
gemini-2.0-flash-exp   - Experimental features
```

### AI Tone System

The AI adapts its responses based on 6 different tones:

| Tone | Description | Temperature | Use Case |
|------|-------------|-------------|----------|
| 😊 **Casual** | Relaxed, everyday language | 0.8 | Friends, informal chats |
| 💼 **Professional** | Business-appropriate | 0.5 | Work conversations |
| ❤️ **Flirty** | Playful, charming | 0.9 | Romantic interests |
| 👥 **Friendly** | Warm, supportive | 0.7 | General conversations |
| 🎭 **Formal** | Respectful, structured | 0.4 | Official communication |
| 😄 **Humorous** | Witty, entertaining | 0.9 | Fun conversations |

### Example AI Request

```javascript
// Get reply suggestions
const response = await fetch('/api/chatbot/suggestions/reply', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    receiverId: '507f1f77bcf86cd799439011',
    tone: 'casual',
    context: {
      userRelationship: 'familiar',
      previousTopics: ['work', 'weekend plans']
    }
  })
});

// Response
{
  "suggestions": [
    {
      "suggestion": "That sounds great! What are your plans?",
      "confidence": 0.85,
      "tone": "casual"
    },
    {
      "suggestion": "Cool! Tell me more about it.",
      "confidence": 0.80,
      "tone": "casual"
    },
    {
      "suggestion": "Nice! I'd love to hear the details.",
      "confidence": 0.75,
      "tone": "casual"
    }
  ]
}
```

## 🔌 Socket.IO Events

### Client → Server
```javascript
// Connection established automatically

// Disconnect handled automatically
```

### Server → Client
```javascript
// New message received
socket.on('newMessage', (message) => {
  // Handle new message
});

// Online users updated
socket.on('getOnlineUsers', (userIds) => {
  // Update online status
});
```

## 📁 Project Structure

```
backened/
├── src/
│   ├── controllers/
│   │   ├── auth.controller.js      # Authentication logic
│   │   ├── message.controller.js   # Messaging logic
│   │   └── chatbot.controller.js   # AI features logic
│   │
│   ├── lib/
│   │   ├── ai.js                   # Gemini AI service
│   │   ├── cloudinary.js           # Image upload service
│   │   ├── db.js                   # Database connection
│   │   ├── socket.js               # Socket.IO setup
│   │   └── utils.js                # Helper functions
│   │
│   ├── middlewares/
│   │   └── auth.middleware.js      # JWT verification
│   │
│   ├── models/
│   │   ├── user.model.js           # User schema
│   │   └── message.model.js        # Message schema
│   │
│   ├── routes/
│   │   ├── auth.route.js           # Auth endpoints
│   │   ├── message.route.js        # Message endpoints
│   │   └── chatbot.route.js        # AI endpoints
│   │
│   ├── seeds/
│   │   └── user.seed.js            # Test data
│   │
│   └── index.js                    # Server entry point
│
├── .env                            # Environment variables
├── package.json                    # Dependencies
└── README.md                       # This file
```

## 🧪 Testing

### Manual Testing

1. **Check server health**
   ```bash
   curl http://localhost:5001/health
   ```

2. **Test AI status**
   ```bash
   curl http://localhost:5001/api/chatbot/status
   ```

3. **Test authentication**
   ```bash
   curl -X POST http://localhost:5001/api/auth/signup \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","fullname":"Test User"}'
   ```

### Expected Responses

```json
// Health check
{
  "status": "ok",
  "timestamp": "2025-11-21T10:30:00.000Z"
}

// AI status
{
  "available": true,
  "provider": "gemini",
  "model": "gemini-2.0-flash",
  "timestamp": "2025-11-21T10:30:00.000Z"
}
```

## 🔒 Security Features

- ✅ **JWT Authentication** - Secure token-based auth
- ✅ **HTTP-Only Cookies** - XSS protection
- ✅ **Password Hashing** - bcrypt with salt rounds
- ✅ **CORS Configuration** - Cross-origin security
- ✅ **Input Validation** - Request validation
- ✅ **Environment Variables** - Secure configuration

## 📊 Performance

- **Message Delivery**: < 100ms average
- **AI Response Time**: 1-3 seconds
- **Image Upload**: < 5 seconds for 5MB files
- **Database Queries**: Optimized with indexes

## 🐛 Troubleshooting

### AI Not Working

1. **Check Gemini API key**
   ```bash
   # Verify key is set in .env
   echo $GEMINI_API_KEY
   ```

2. **Test API connection**
   ```bash
   curl "https://generativelanguage.googleapis.com/v1beta/models?key=YOUR_KEY"
   ```

3. **Check server logs**
   ```bash
   # Look for AI initialization messages
   npm run dev
   # Should see: "✅ Gemini API connected successfully"
   ```

### Database Connection Issues

1. **Verify MongoDB is running**
   ```bash
   # For local MongoDB
   brew services list | grep mongodb
   
   # For MongoDB Atlas
   # Check connection string format
   ```

2. **Test connection**
   ```bash
   mongosh "your-connection-string"
   ```

### Port Already in Use

```bash
# Find process using port 5001
lsof -ti:5001

# Kill the process
kill -9 $(lsof -ti:5001)

# Or use different port in .env
PORT=5002
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5001

# Use strong secrets
JWT_SECRET=$(openssl rand -base64 32)

# Production database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/chatty

# Gemini API
GEMINI_API_KEY=your-production-key
AI_MODEL=gemini-2.0-flash
```

### Deployment Platforms

- **Railway** - Easy deployment, free tier
- **Render** - Simple setup, auto-deploy
- **Heroku** - Classic platform
- **DigitalOcean** - Full control
- **AWS/GCP** - Enterprise scale

### Health Monitoring

The server includes a `/health` endpoint for monitoring:

```bash
curl http://your-domain.com/health
```

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5001 | Server port |
| `NODE_ENV` | No | development | Environment mode |
| `MONGODB_URI` | Yes | - | MongoDB connection string |
| `JWT_SECRET` | Yes | - | JWT signing secret |
| `CLOUDINARY_CLOUD_NAME` | Yes | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Yes | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Yes | - | Cloudinary API secret |
| `GEMINI_API_KEY` | Yes | - | Google Gemini API key |
| `AI_PROVIDER` | No | gemini | AI provider name |
| `AI_MODEL` | No | gemini-2.0-flash | Gemini model name |
| `AI_MAX_TOKENS` | No | 500 | Max AI response tokens |
| `AI_TEMPERATURE` | No | 0.7 | AI creativity level |

## 📚 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Socket.IO Documentation](https://socket.io/docs/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 💬 Support

For issues or questions:
- Open an issue on GitHub
- Check troubleshooting section
- Review API documentation

---

**Built with ❤️ using Node.js, Express, MongoDB, and Google Gemini AI**
