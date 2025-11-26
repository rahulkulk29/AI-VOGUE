# Prism AI 3.0 - Backend API

AI-powered style and care chatbot backend with Gemini AI and SERP API integration.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ installed
- API keys for:
  - Google Gemini API
  - SerpAPI (or Google Custom Search)
  - Appwrite (optional but recommended)

### Installation

1. **Install dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Then edit `.env` and fill in your API keys:
   ```env
   GEMINI_API_KEY=your_actual_gemini_key
   SERP_API_KEY=your_actual_serp_key
   APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   APPWRITE_PROJECT_ID=your_project_id
   # ... etc
   ```

3. **Start the server:**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

The server will start on `http://localhost:3000`

## 📋 API Endpoints

### Health Check
```http
GET /health
```

Response:
```json
{
  "status": "OK",
  "service": "Prism AI 3.0 Backend",
  "timestamp": "2024-11-23T22:30:00.000Z"
}
```

### Chat with AI
```http
POST /api/chat
Content-Type: application/json

{
  "userId": "user123",
  "message": "What moisturizer should I use for oily skin?"
}
```

Response:
```json
{
  "advice": "For oily, acne-prone skin, look for oil-free, non-comedogenic moisturizers with ingredients like niacinamide and hyaluronic acid...",
  "products": [
    {
      "title": "Neutrogena Oil-Free Moisturizer",
      "price": "₹399",
      "store": "Amazon",
      "url": "https://amazon.in/..."
    }
  ],
  "timestamp": "2024-11-23T22:30:00.000Z"
}
```

## 🔧 How It Works

1. **User sends a question** via the chat interface
2. **Backend fetches user profile** from Appwrite (if available)
3. **Gemini AI generates response:**
   - Analyzes user's skin/hair/style profile
   - Provides personalized advice
   - Suggests product search parameters
4. **SERP API searches for products:**
   - Searches Indian e-commerce sites (Amazon.in, Flipkart, Nykaa, etc.)
   - Filters by budget and concerns
   - Returns live product links with prices
5. **Combined response** sent back to frontend

## 🛠️ Configuration

### Required Environment Variables

| Variable | Description | Where to Get |
|----------|-------------|--------------|
| `GEMINI_API_KEY` | Google Gemini AI API key | [Google AI Studio](https://makersuite.google.com/app/apikey) |
| `SERP_API_KEY` | SerpAPI key for product search | [SerpAPI](https://serpapi.com/manage-api-key) |

### Optional (for profile integration)

| Variable | Description |
|----------|-------------|
| `APPWRITE_ENDPOINT` | Appwrite server endpoint |
| `APPWRITE_PROJECT_ID` | Your Appwrite project ID |
| `APPWRITE_API_KEY` | Server-side API key |
| `APPWRITE_DATABASE_ID` | Database ID |
| `APPWRITE_COLLECTION_ID` | User profiles collection ID |

## 📦 Dependencies

- **express** - Web framework
- **@google/generative-ai** - Gemini AI SDK
- **serpapi** - Product search API
- **node-appwrite** - Appwrite SDK (optional)
- **cors** - CORS middleware
- **dotenv** - Environment variable management

## 🔒 Security Notes

- Never commit `.env` file to version control
- Use environment-specific `.env` files for deployment
- Implement proper authentication before production
- Set appropriate CORS origins in production

## 🚢 Deployment

### Vercel (Serverless)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Traditional Server
```bash
# On your server
npm install
npm start
```

Use PM2 for process management:
```bash
npm install -g pm2
pm2 start server.js --name prism-ai
```

## 🐛 Troubleshooting

### "Missing environment variables" warning
- Copy `.env.example` to `.env`
- Fill in all required API keys

### CORS errors
- Add your frontend URL to `ALLOWED_ORIGINS` in `.env`
- Check that frontend is calling the correct backend URL

### Gemini API errors
- Verify your API key is valid
- Check you have quota remaining
- Ensure you're using `gemini-pro` model

### SERP API errors
- Verify your API key is valid
- Check your SerpAPI plan supports Google search
- Ensure you have credits remaining

## 📄 License

MIT License - AI VOGUE 2024
