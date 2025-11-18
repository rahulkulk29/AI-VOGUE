# Frontend - AI VOGUE

## 📁 Directory Structure

```
frontend/
├── public/              # HTML pages (entry points)
│   ├── index.html      # Homepage
│   ├── login.html      # Authentication page
│   ├── prism-ai-appwrite.html  # AI assistant (Appwrite integrated)
│   ├── profile.html    # User profile
│   ├── categories.html # Product categories
│   ├── checkout.html   # Shopping cart & checkout
│   └── *.html         # Other pages
├── css/                # Stylesheets
│   ├── styles.css     # Global styles
│   ├── prism-ai.css   # Prism AI specific styles
│   ├── login.css      # Login page styles
│   └── *.css          # Component styles
├── js/                 # JavaScript modules
│   ├── config/        # Configuration files
│   │   ├── appwrite-config.js  # Appwrite setup
│   │   └── api-keys.js         # API configuration
│   ├── services/      # Business logic services
│   │   ├── gemini-service.js         # AI service
│   │   ├── preferences-service.js    # User preferences
│   │   └── recommendation-engine.js  # Product recommendations
│   ├── auth/          # Authentication modules
│   │   ├── auth.js           # Auth handler
│   │   ├── auth-check.js     # Auth verification
│   │   └── login.js          # Login logic
│   ├── pages/         # Page-specific scripts
│   │   ├── prismAI-appwrite.js  # Prism AI main
│   │   ├── profile.js           # Profile manager
│   │   ├── product.js           # Product page
│   │   └── checkout.js          # Checkout logic
│   ├── utils/         # Utility functions
│   │   ├── parallax.js       # Parallax effects
│   │   └── login-parallax.js # Login animations
│   ├── main.js        # Global JavaScript
│   └── appwrite-config.js  # Appwrite client setup
└── assets/            # Static assets
    ├── images/        # Image files
    ├── icons/         # Icon files
    └── videos/        # Video files
```

## 🚀 Getting Started

### Local Development

1. **Serve the frontend**
   ```bash
   # Using Python
   cd public
   python -m http.server 8000
   
   # Using Node.js
   npx serve public
   
   # Using PHP
   php -S localhost:8000 -t public
   ```

2. **Open in browser**
   ```
   http://localhost:8000
   ```

### Configuration

#### Appwrite Setup
Edit `js/config/appwrite-config.js`:
```javascript
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID',
    databaseId: 'YOUR_DATABASE_ID',
    collectionId: 'YOUR_COLLECTION_ID',
    functionId: 'gemini-proxy'
};
```

#### API Keys (if needed)
Edit `js/config/api-keys.js` for any additional API configurations.

## 📄 HTML Pages

### Core Pages
- **index.html** - Landing page with hero section and features
- **login.html** - User authentication (login/signup)
- **prism-ai-appwrite.html** - AI beauty assistant with full Appwrite integration
- **profile.html** - User profile and preferences management

### Shopping Pages
- **categories.html** - Product categories overview
- **shirts.html, pants.html, shoes.html** - Category-specific product listings
- **product.html** - Product detail page
- **checkout.html** - Shopping cart and checkout

### Information Pages
- **about.html** - About AI VOGUE
- **contact.html** - Contact information
- **creative-threads.html** - Creative Threads feature

## 🎨 CSS Architecture

### Global Styles
- **styles.css** - Base styles, typography, layout, animations

### Component Styles
- **prism-ai.css** - Prism AI interface styles
- **login.css** - Login page specific styles
- **profile.css** - Profile page styles
- **product.css** - Product pages styles
- **checkout.css** - Checkout page styles
- **feature.css** - Feature sections
- **prism-products.css** - Product recommendations in Prism AI

### Design System
- **Colors**: Luxury black/gold theme
- **Typography**: Playfair Display (headings), Inter (body)
- **Spacing**: 8px base unit
- **Breakpoints**: 
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px

## 📜 JavaScript Modules

### Configuration (`js/config/`)
- **appwrite-config.js** - Appwrite client initialization and service exports
- **api-keys.js** - API key management (deprecated - use Appwrite Functions)

### Services (`js/services/`)
- **gemini-service.js** - Gemini AI integration via Appwrite Function
- **preferences-service.js** - User preference CRUD operations
- **recommendation-engine.js** - Product recommendation logic

### Authentication (`js/auth/`)
- **auth.js** - Authentication state management
- **auth-check.js** - Protected route verification
- **login.js** - Login/signup form handling

### Pages (`js/pages/`)
- **prismAI-appwrite.js** - Main Prism AI application logic
- **profile.js** - Profile page functionality
- **product.js** - Product page interactions
- **checkout.js** - Cart and checkout logic

### Utilities (`js/utils/`)
- **parallax.js** - Parallax scroll effects
- **login-parallax.js** - Login page animations

## 🔧 Key Features

### Prism AI Integration
```javascript
// Import services
import { preferencesService } from '../services/preferences-service.js';
import { geminiService } from '../services/gemini-service.js';
import { authService } from '../appwrite-config.js';

// Use services
const preferences = await preferencesService.getUserPreferences();
const recommendations = await geminiService.getRecommendations(query, preferences);
```

### Authentication Flow
```javascript
// Check auth status
const user = await authService.getCurrentUser();

// Login
await authService.login(email, password);

// Signup
await authService.signup(email, password, name);

// Logout
await authService.logout();
```

### Preference Management
```javascript
// Save preferences
await preferencesService.savePreferences(userId, preferences);

// Load preferences
const prefs = await preferencesService.getUserPreferences(userId);

// Update preferences
await preferencesService.updatePreferences(userId, updates);
```

## 🎯 Path References

### In HTML Files
All paths are relative to the `public/` directory:
```html
<!-- CSS -->
<link rel="stylesheet" href="../css/styles.css">

<!-- JavaScript -->
<script type="module" src="../js/pages/prismAI-appwrite.js"></script>

<!-- Images -->
<img src="../assets/images/logo.png" alt="Logo">
```

### In JavaScript Files
Paths are relative to the file's location:
```javascript
// From pages/ to services/
import { geminiService } from '../services/gemini-service.js';

// From services/ to config/
import { authService } from '../appwrite-config.js';
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads correctly
- [ ] Navigation works on all pages
- [ ] Login/signup functionality
- [ ] Prism AI quiz completion
- [ ] AI recommendations display
- [ ] Profile save/load
- [ ] Product browsing
- [ ] Add to cart
- [ ] Checkout process
- [ ] Responsive design (mobile/tablet/desktop)

### Browser Testing
Test on:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🐛 Common Issues

### Import Errors
**Problem**: `Failed to resolve module specifier`
**Solution**: Ensure all imports use relative paths with `.js` extension

### CORS Errors
**Problem**: `CORS policy blocked`
**Solution**: Serve via HTTP server, not file:// protocol

### Appwrite Connection
**Problem**: `Failed to connect to Appwrite`
**Solution**: Check `appwrite-config.js` credentials and network

### Module Not Found
**Problem**: `Cannot find module`
**Solution**: Verify file paths match new directory structure

## 📦 Deployment

### Static Hosting
Deploy `public/` folder to:
- **Vercel**: `vercel deploy public`
- **Netlify**: Drag and drop `public` folder
- **GitHub Pages**: Push `public` to `gh-pages` branch
- **Firebase**: `firebase deploy --only hosting`

### Build Optimization (Optional)
```bash
# Minify CSS
npx clean-css-cli -o public/css/styles.min.css public/css/styles.css

# Minify JS (if not using modules)
npx terser public/js/main.js -o public/js/main.min.js
```

### Environment-Specific Config
For production, update `appwrite-config.js` with production endpoints.

## 🔒 Security Notes

- Never commit API keys to version control
- Use Appwrite Functions for sensitive API calls
- Implement proper authentication checks
- Validate user input on client and server
- Use HTTPS in production

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Gemini AI Documentation](https://ai.google.dev/docs)
- [MDN Web Docs](https://developer.mozilla.org/)

---

**For backend documentation, see `../backend/README.md`**
