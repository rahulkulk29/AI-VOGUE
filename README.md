# AI VOGUE - Luxury Fashion Technology Platform

> Imagine the look, see it in 2D, wear it in reality. Luxury tech for modern fashion journeys.

## 🌟 Overview

AI VOGUE is a cutting-edge fashion technology platform that combines AI-powered recommendations, virtual try-ons, and personalized styling to revolutionize the online shopping experience.

## 📁 Project Structure

```
website_v5/
├── frontend/          # Client-side application
│   ├── public/       # HTML pages
│   ├── css/          # Stylesheets
│   ├── js/           # JavaScript modules
│   └── assets/       # Images, icons, videos
├── backend/          # Server-side code
│   ├── functions/    # Appwrite cloud functions
│   └── config/       # Backend configuration
├── docs/             # Documentation
│   ├── setup/        # Setup guides
│   ├── deployment/   # Deployment instructions
│   ├── architecture/ # System architecture docs
│   ├── features/     # Feature documentation
│   └── security/     # Security guidelines
└── archive/          # Archived files
```

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Appwrite account (for backend services)
- Gemini API key (for AI features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd website_v5
   ```

2. **Configure Appwrite**
   - See `docs/setup/QUICK-START.md` for detailed instructions
   - Update `frontend/js/config/appwrite-config.js` with your credentials

3. **Deploy Appwrite Function**
   - See `docs/deployment/APPWRITE-FUNCTION-DEPLOYMENT.md`
   - Deploy the Gemini AI proxy function from `backend/functions/gemini-ai-proxy/`

4. **Serve the frontend**
   ```bash
   # Using Python
   cd frontend/public
   python -m http.server 8000
   
   # Using Node.js
   npx serve frontend/public
   ```

5. **Open in browser**
   ```
   http://localhost:8000
   ```

## ✨ Features

### 🎨 Prism AI
- **AI-Powered Recommendations**: Personalized product suggestions based on skin type, hair type, and style preferences
- **11-Question Onboarding**: Comprehensive quiz to understand user preferences
- **Product Compatibility Analysis**: Percentage-based matching with detailed pros/cons
- **Ingredient Analysis**: Smart analysis of product ingredients for user's skin/hair type
- **Image Upload**: Upload product images for AI analysis

### 👤 User Management
- **Secure Authentication**: Email/password and OAuth login via Appwrite
- **Profile Management**: Save and manage personal preferences
- **Preference Persistence**: Store preferences in Appwrite database
- **Guest Mode**: Use without account (local storage only)

### 🛍️ Shopping Features
- **Product Catalog**: Browse shirts, pants, shoes, and accessories
- **Smart Search**: Find products by category, style, or occasion
- **Shopping Cart**: Add to cart and checkout
- **Wishlist**: Save favorite items

### 🔒 Security
- **API Key Protection**: Gemini API key secured via Appwrite Functions
- **Server-Side Proxy**: No client-side API exposure
- **Rate Limiting**: Built-in protection against abuse
- **Authentication**: Secure user sessions

## 📚 Documentation

- **[Quick Start Guide](docs/setup/QUICK-START.md)** - Get up and running quickly
- **[System Architecture](docs/architecture/SYSTEM_ARCHITECTURE.md)** - Technical overview
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Production deployment
- **[Prism AI Implementation](docs/features/PRISM-AI-IMPLEMENTATION-GUIDE.md)** - AI features guide
- **[Security Guidelines](docs/security/SECURITY-UPGRADE.md)** - Security best practices

## 🛠️ Technology Stack

### Frontend
- **HTML5/CSS3**: Modern, responsive design
- **JavaScript (ES6+)**: Modular architecture
- **Appwrite SDK**: Backend integration
- **CDN**: Fast content delivery

### Backend
- **Appwrite**: BaaS (Backend as a Service)
  - Authentication
  - Database
  - Cloud Functions
  - Storage
- **Gemini AI**: Google's generative AI for recommendations
- **Node.js**: Serverless functions runtime

## 🔧 Configuration

### Frontend Configuration
Edit `frontend/js/config/appwrite-config.js`:
```javascript
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID',
    databaseId: 'YOUR_DATABASE_ID',
    collectionId: 'YOUR_COLLECTION_ID'
};
```

### Backend Configuration
Edit `backend/config/appwrite.config.json` for Appwrite CLI deployment.

### Environment Variables (Appwrite Function)
- `GEMINI_API_KEY`: Your Gemini API key
- `GEMINI_MODEL`: Model to use (default: gemini-2.5-flash)

## 📦 Deployment

### Frontend Deployment
Deploy to any static hosting service:
- **Vercel**: `vercel deploy frontend/public`
- **Netlify**: Drag and drop `frontend/public` folder
- **GitHub Pages**: Push to `gh-pages` branch
- **Firebase Hosting**: `firebase deploy`

### Backend Deployment
Deploy Appwrite function:
```bash
cd backend/functions/gemini-ai-proxy
tar -czf gemini-ai-proxy.tar.gz .
# Upload to Appwrite Console → Functions
```

See [Deployment Guide](docs/deployment/APPWRITE-FUNCTION-DEPLOYMENT.md) for details.

## 🧪 Testing

### Manual Testing
1. Open `frontend/public/index.html` in browser
2. Navigate to Prism AI
3. Complete onboarding quiz
4. Test AI recommendations
5. Verify profile save/load

### Function Testing
Test Appwrite function in Console → Functions → Execute:
```json
{
  "userQuery": "Recommend a moisturizer for oily skin",
  "userProfile": {
    "skinType": "oily",
    "skincareBudget": "mid"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

**Function Timeout**
- Increase timeout in Appwrite Console → Functions → Settings
- Recommended: 60-90 seconds

**CORS Errors**
- Ensure Appwrite project has correct platform URLs
- Add `http://localhost:8000` for local development

**Import Errors**
- Check that all paths use relative imports
- Verify file structure matches documentation

**Authentication Issues**
- Clear browser cache and cookies
- Check Appwrite project status
- Verify API keys are correct

See [Troubleshooting Guide](docs/setup/SETUP-CHECKLIST.md#troubleshooting) for more.

## 📄 License

Copyright © 2024 AI VOGUE. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, contact the development team.

## 📞 Support

- **Documentation**: See `docs/` folder
- **Issues**: Check troubleshooting guides
- **Updates**: See `CHANGELOG.md` (if available)

---

**Built with ❤️ using Appwrite, Gemini AI, and modern web technologies.**
