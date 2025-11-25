# Backend - AI VOGUE

## 📁 Directory Structure

```
backend/
├── functions/              # Appwrite Cloud Functions
│   └── gemini-ai-proxy/   # Gemini AI proxy function
│       ├── src/
│       │   └── main.js    # Function entry point
│       ├── package.json   # Dependencies
│       └── README.md      # Function documentation
└── config/
    └── appwrite.config.json  # Appwrite CLI configuration
```

## 🚀 Overview

The backend consists of serverless Appwrite Cloud Functions that handle:
- **AI Processing**: Secure Gemini API calls
- **Data Management**: User preferences and profiles
- **Authentication**: User session management
- **Storage**: File uploads and management

## 🔧 Appwrite Services Used

### Authentication
- Email/password authentication
- OAuth providers (optional)
- Session management
- User account operations

### Database
- **Collections**:
  - `user_preferences` - User beauty/fashion preferences
  - `user_profiles` - Extended user information
  - `conversations` - AI chat history (optional)

### Functions
- **gemini-ai-proxy** - Secure proxy for Gemini AI API calls

### Storage
- Product images
- User uploads
- Profile pictures

## 📦 Gemini AI Proxy Function

### Purpose
Securely calls Google's Gemini AI API without exposing the API key to clients.

### Location
`functions/gemini-ai-proxy/`

### Features
- ✅ API key protection (server-side only)
- ✅ Multiple model fallback (gemini-2.5-flash, gemini-2.5-pro, etc.)
- ✅ Request timeout handling (25 seconds)
- ✅ Detailed logging for debugging
- ✅ Error handling with fallback responses
- ✅ User profile context integration
- ✅ Product recommendation formatting

### Environment Variables
Set in Appwrite Console → Functions → Settings → Environment Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Your Gemini API key | `AIzaSy...` |
| `GEMINI_MODEL` | Model to use (optional) | `gemini-2.5-flash` |

### Request Format
```json
{
  "userQuery": "Recommend a moisturizer for oily skin",
  "userProfile": {
    "skinType": "oily",
    "skinConcern": "acne",
    "hairType": "straight",
    "skincareBudget": "mid",
    "fashionBudget": "mid",
    "ageRange": "twenties"
  },
  "imageData": "base64_encoded_image" // optional
}
```

### Response Format
```json
{
  "success": true,
  "data": {
    "generalAdvice": "For oily, acne-prone skin...",
    "products": [
      {
        "name": "CeraVe Foaming Facial Cleanser",
        "brand": "CeraVe",
        "category": "Skincare",
        "price": "$14.99",
        "ingredients": ["Ceramides", "Niacinamide", "Hyaluronic Acid"],
        "purchaseLink": "https://www.amazon.com/...",
        "compatibility": 92,
        "pros": ["Oil-free formula", "Non-comedogenic"],
        "cons": ["May be drying for some"],
        "applicationTips": "Use twice daily on damp skin"
      }
    ],
    "additionalTips": ["Avoid heavy oils", "Use sunscreen daily"]
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "fallback": true
}
```

## 🚀 Deployment

### Prerequisites
- Appwrite account
- Appwrite CLI installed (optional)
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Method 1: Web Console (Recommended)

1. **Create Function**
   - Go to Appwrite Console → Functions
   - Click "Create Function"
   - Name: `Gemini AI Proxy`
   - Function ID: `gemini-proxy`
   - Runtime: `Node.js 18.0`
   - Entrypoint: `src/main.js`
   - Execute Access: `Any` (or `Users` for authenticated only)

2. **Package Function**
   ```bash
   cd backend/functions/gemini-ai-proxy
   tar -czf gemini-ai-proxy.tar.gz .
   ```

3. **Deploy**
   - Functions → Source → Manual Deployment
   - Upload `gemini-ai-proxy.tar.gz`
   - Click "Deploy"
   - Wait for "Ready" status

4. **Set Environment Variables**
   - Functions → Settings → Environment Variables
   - Add `GEMINI_API_KEY` with your API key
   - (Optional) Add `GEMINI_MODEL` to override default model

5. **Test**
   - Functions → Execute
   - Paste test payload (see above)
   - Click "Execute Now"
   - Verify success response

### Method 2: Appwrite CLI

1. **Install CLI**
   ```bash
   # Windows
   Invoke-WebRequest -Uri https://appwrite.io/cli/install.ps1 -OutFile install.ps1; ./install.ps1
   
   # macOS/Linux
   curl -sL https://appwrite.io/cli/install.sh | bash
   ```

2. **Login**
   ```bash
   appwrite login
   ```

3. **Deploy Function**
   ```bash
   cd backend/functions/gemini-ai-proxy
   appwrite deploy function --function-id gemini-proxy
   ```

4. **Set Environment Variable**
   ```bash
   appwrite functions updateVariable \
     --functionId gemini-proxy \
     --key GEMINI_API_KEY \
     --value "YOUR_API_KEY"
   ```

## 🗄️ Database Schema

### Collection: `user_preferences`

| Field | Type | Description |
|-------|------|-------------|
| `userId` | String | User ID (indexed) |
| `skinType` | String | oily, dry, combination, normal, sensitive |
| `skinConcern` | String | acne, aging, dryness, sensitivity, etc. |
| `hairType` | String | straight, wavy, curly, coily |
| `hairTexture` | String | fine, medium, coarse |
| `hairConcern` | String | dryness, frizz, damage, thinning, etc. |
| `stylePreference` | String | casual, formal, streetwear, bohemian, etc. |
| `skincareBudget` | String | budget, mid, premium, luxury |
| `fashionBudget` | String | budget, mid, premium, luxury |
| `ageRange` | String | teens, twenties, thirties, etc. |
| `occasions` | String | casual, work, formal, athletic |
| `allergens` | Array | List of ingredients to avoid |
| `preferredIngredients` | Array | Preferred ingredients |
| `avoidIngredients` | Array | Ingredients to avoid |
| `createdAt` | DateTime | Creation timestamp |
| `updatedAt` | DateTime | Last update timestamp |

### Indexes
- `userId` (unique)
- `createdAt`
- `updatedAt`

### Permissions
- **Read**: User (owner only)
- **Write**: User (owner only)
- **Create**: Any authenticated user
- **Update**: User (owner only)
- **Delete**: User (owner only)

## 🔒 Security

### API Key Protection
- ✅ Gemini API key stored in Appwrite environment variables
- ✅ Never exposed to client-side code
- ✅ Function acts as secure proxy

### Authentication
- ✅ User authentication via Appwrite
- ✅ Session-based access control
- ✅ Secure password hashing

### Rate Limiting
- Implement in function code if needed
- Use Appwrite's built-in rate limiting

### Input Validation
- Validate all user inputs
- Sanitize data before processing
- Prevent injection attacks

## 📊 Monitoring

### Function Logs
View in Appwrite Console → Functions → Executions:
- Execution status (success/failed)
- Duration
- Logs output
- Error messages

### Metrics to Monitor
- Execution count
- Success rate
- Average duration
- Error rate
- API usage (Gemini)

### Alerts
Set up alerts for:
- High error rate
- Timeout issues
- API quota limits
- Unusual traffic patterns

## 🐛 Troubleshooting

### Function Timeout
**Problem**: Function times out after 30 seconds
**Solution**: 
- Increase timeout in Settings (max 900s)
- Optimize prompt length
- Reduce `maxOutputTokens`

### Model Not Found
**Problem**: `models/gemini-xxx is not found`
**Solution**:
- Check available models in error message
- Update `GEMINI_MODEL` environment variable
- Use fallback models in code

### No Response from Gemini
**Problem**: Function hangs, no Gemini API call
**Solution**:
- Check Gemini API key is valid
- Verify network connectivity
- Check Appwrite function logs
- Test API key directly in Google AI Studio

### CORS Errors
**Problem**: CORS policy blocks requests
**Solution**:
- Add your domain to Appwrite project platforms
- For local dev, add `http://localhost:8000`

## 📈 Performance Optimization

### Response Time
- Use `gemini-2.5-flash` for faster responses
- Reduce `maxOutputTokens` (512 recommended)
- Simplify prompts
- Cache frequent queries (future enhancement)

### Cost Optimization
- Monitor Gemini API usage
- Implement client-side caching
- Use debouncing for user input
- Set appropriate rate limits

## 🔄 Updates & Maintenance

### Updating Function Code
1. Edit `src/main.js`
2. Package: `tar -czf gemini-ai-proxy.tar.gz .`
3. Upload in Console → Functions → Source
4. Or deploy via CLI: `appwrite deploy function`

### Updating Dependencies
1. Edit `package.json`
2. Redeploy function
3. Appwrite will install new dependencies

### Rollback
- Console → Functions → Deployments
- View history
- Click "..." → "Activate" on previous version

## 📚 Additional Resources

- [Appwrite Functions Documentation](https://appwrite.io/docs/products/functions)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

---

**For frontend documentation, see `../frontend/README.md`**
