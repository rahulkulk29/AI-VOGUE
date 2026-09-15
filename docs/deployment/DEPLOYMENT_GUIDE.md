# Prism AI - Appwrite Integration Deployment Guide

This guide will walk you through setting up the complete Prism AI system with Appwrite backend integration.

## Prerequisites

- Appwrite Cloud account (https://cloud.appwrite.io) or self-hosted Appwrite instance
- Google AI Studio account for Gemini API key
- Basic knowledge of JavaScript and web development

## Step 1: Create Appwrite Project

1. **Sign up/Login to Appwrite Cloud**
   - Go to https://cloud.appwrite.io
   - Create an account or login

2. **Create New Project**
   - Click "Create Project"
   - Name: `prism-ai`
   - Note down your Project ID

3. **Configure Platform**
   - Go to "Settings" → "Platforms"
   - Add "Web App"
   - Name: `Prism AI Web`
   - Hostname: `localhost` (for development) or your domain

## Step 2: Set Up Authentication

1. **Enable Email/Password Auth**
   - Go to "Auth" → "Settings"
   - Enable "Email/Password"
   - Set session length as needed (default: 1 year)

2. **Configure Security (Optional)**
   - Set password policy
   - Enable email verification if desired

## Step 3: Create Database and Collections

1. **Create Database**
   - Go to "Databases"
   - Click "Create Database"
   - Database ID: `prism_ai_db`
   - Name: `Prism AI Database`

2. **Create Collections**

   ### Collection 1: user_profiles
   - Collection ID: `user_profiles`
   - Name: `User Profiles`
   
   **Attributes:**
   ```
   userId (string, 36, required) - User's Appwrite ID
   displayName (string, 100, required) - User's display name
   email (string, 320, required) - User's email
   completedOnboarding (boolean, required) - Onboarding status
   createdAt (datetime, required) - Creation timestamp
   updatedAt (datetime, required) - Last update timestamp
   ```
   
   **Indexes:**
   ```
   userId_index: userId (ASC)
   email_index: email (ASC)
   ```
   
   **Permissions:**
   - Create: `users`
   - Read: `user:[USER_ID]`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

   ### Collection 2: quiz_responses
   - Collection ID: `quiz_responses`
   - Name: `Quiz Responses`
   
   **Attributes:**
   ```
   userId (string, 36, required) - User's Appwrite ID
   skincare (string, 1000, required) - Skincare preferences JSON
   clothing (string, 1000, required) - Clothing preferences JSON
   rawAnswers (string, 2000, required) - Raw quiz answers JSON
   version (string, 10, required) - Schema version
   createdAt (datetime, required) - Creation timestamp
   updatedAt (datetime, required) - Last update timestamp
   ```
   
   **Indexes:**
   ```
   userId_index: userId (ASC)
   updated_index: updatedAt (DESC)
   ```
   
   **Permissions:**
   - Create: `user:[USER_ID]`
   - Read: `user:[USER_ID]`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

   ### Collection 3: chat_sessions
   - Collection ID: `chat_sessions`
   - Name: `Chat Sessions`
   
   **Attributes:**
   ```
   userId (string, 36, required) - User's Appwrite ID
   title (string, 200, required) - Session title
   messageCount (integer, required) - Number of messages
   lastMessageAt (datetime, required) - Last message timestamp
   createdAt (datetime, required) - Creation timestamp
   updatedAt (datetime, required) - Last update timestamp
   ```
   
   **Indexes:**
   ```
   userId_index: userId (ASC)
   lastMessage_index: lastMessageAt (DESC)
   user_lastMessage: userId (ASC), lastMessageAt (DESC)
   ```
   
   **Permissions:**
   - Create: `user:[USER_ID]`
   - Read: `user:[USER_ID]`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

   ### Collection 4: chat_messages
   - Collection ID: `chat_messages`
   - Name: `Chat Messages`
   
   **Attributes:**
   ```
   sessionId (string, 36, required) - Chat session ID
   userId (string, 36, required) - User's Appwrite ID
   role (string, 20, required) - 'user' or 'assistant'
   text (string, 5000, required) - Message text
   imageFileId (string, 36, optional) - Uploaded image file ID
   products (string, 2000, optional) - Product recommendations JSON
   outfits (string, 2000, optional) - Outfit suggestions JSON
   createdAt (datetime, required) - Creation timestamp
   ```
   
   **Indexes:**
   ```
   session_index: sessionId (ASC)
   session_created: sessionId (ASC), createdAt (ASC)
   user_index: userId (ASC)
   ```
   
   **Permissions:**
   - Create: `user:[USER_ID]`
   - Read: `user:[USER_ID]`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

## Step 4: Create Storage Bucket

1. **Create Bucket**
   - Go to "Storage"
   - Click "Create Bucket"
   - Bucket ID: `chat-uploads`
   - Name: `Chat Image Uploads`
   - File Security: Enabled
   - Maximum File Size: 10MB
   - Allowed File Extensions: `jpg,jpeg,png,gif,webp`

2. **Set Permissions**
   - Create: `users`
   - Read: `user:[USER_ID]`
   - Update: `user:[USER_ID]`
   - Delete: `user:[USER_ID]`

## Step 5: Deploy Appwrite Function

1. **Install Appwrite CLI**
   ```bash
   npm install -g appwrite-cli
   ```

2. **Login to Appwrite**
   ```bash
   appwrite login
   ```

3. **Initialize Function**
   ```bash
   appwrite init function
   ```
   - Function ID: `gemini-proxy`
   - Runtime: `node-18.0`
   - Template: `starter`

4. **Copy Function Files**
   - Copy `appwrite-function/gemini-proxy.js` to your function directory
   - Copy `appwrite-function/package.json` to your function directory

5. **Set Environment Variables**
   ```bash
   appwrite functions createVariable \
     --functionId gemini-proxy \
     --key GEMINI_API_KEY \
     --value "your-gemini-api-key"
   
   appwrite functions createVariable \
     --functionId gemini-proxy \
     --key APPWRITE_DATABASE_ID \
     --value "prism_ai_db"
   
   appwrite functions createVariable \
     --functionId gemini-proxy \
     --key APPWRITE_BUCKET_ID \
     --value "chat-uploads"
   ```

6. **Deploy Function**
   ```bash
   appwrite functions deploy --functionId gemini-proxy
   ```

## Step 6: Configure Frontend

1. **Update Configuration**
   - Open `appwrite-config.js`
   - Replace `YOUR_PROJECT_ID` with your actual Appwrite Project ID
   - Update endpoint if using self-hosted Appwrite

2. **Update Function ID**
   - In `appwrite-config.js`, set `functionId` to `gemini-proxy`

## Step 7: Test the Application

1. **Start Local Server**
   ```bash
   python -m http.server 8000
   ```

2. **Open Application**
   - Navigate to `http://localhost:8000/prism-ai-appwrite.html`

3. **Test Features**
   - Sign up with a new account
   - Complete the onboarding quiz
   - Test chat functionality
   - Upload an image in chat
   - Verify data persistence

## Step 8: Production Deployment

1. **Update Configuration**
   - Set production domain in Appwrite platform settings
   - Update CORS settings if needed
   - Configure proper SSL certificates

2. **Environment Variables**
   - Ensure all function environment variables are set
   - Use production Gemini API key

3. **Security Checklist**
   - Review all collection permissions
   - Enable rate limiting if needed
   - Set up monitoring and logging
   - Configure backup strategies

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check project ID in configuration
   - Verify platform hostname settings
   - Ensure CORS is properly configured

2. **Database Permission Errors**
   - Verify collection permissions are set correctly
   - Check user authentication status
   - Ensure indexes are created

3. **Function Execution Errors**
   - Check function logs in Appwrite console
   - Verify environment variables are set
   - Ensure Gemini API key is valid

4. **Image Upload Issues**
   - Check storage bucket permissions
   - Verify file size and type restrictions
   - Ensure bucket ID matches configuration

### Debug Mode

Enable debug mode by setting `debug: true` in your configuration:

```javascript
// In appwrite-config.js
export const ENV_CONFIG = {
    development: {
        ...APPWRITE_CONFIG,
        debug: true // Enable detailed logging
    }
};
```

## Migration from localStorage

If you have existing localStorage data, you can migrate it:

1. **Export Existing Data**
   ```javascript
   // Run in browser console on old version
   const profile = localStorage.getItem('prismAI_profile');
   const conversations = localStorage.getItem('prismAI_conversations');
   console.log('Profile:', profile);
   console.log('Conversations:', conversations);
   ```

2. **Import to Appwrite**
   - Sign up with the same email
   - Complete onboarding with same answers
   - Data will be automatically saved to Appwrite

## Support

For issues and questions:
- Check Appwrite documentation: https://appwrite.io/docs
- Review function logs in Appwrite console
- Verify all configuration settings
- Test with browser developer tools open

## Security Notes

- Never expose API keys in frontend code
- Use Appwrite Functions for secure API calls
- Regularly review and update permissions
- Monitor usage and set appropriate limits
- Keep Appwrite and dependencies updated