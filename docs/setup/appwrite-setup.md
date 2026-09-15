# Appwrite Integration Setup Guide

## Step 1: Appwrite Project Setup

### 1.1 Create Appwrite Project
1. Go to [Appwrite Console](https://cloud.appwrite.io/)
2. Create a new project: `prism-ai-vogue`
3. Note down:
   - **Endpoint URL**: `https://cloud.appwrite.io/v1`
   - **Project ID**: (copy from console)

### 1.2 Configure Authentication
1. Go to Auth → Settings
2. Enable **Email/Password** authentication
3. Set session length to 365 days (optional)
4. Configure allowed domains: `localhost`, your production domain

### 1.3 Create API Key
1. Go to Overview → API Keys
2. Create new API key: `prism-ai-server`
3. Grant permissions:
   - `databases.read`
   - `databases.write` 
   - `functions.read`
   - `functions.write`
   - `storage.read`
   - `storage.write`
4. **Save the API key securely**

## Step 2: Database Collections Setup

### 2.1 Create Database
1. Go to Databases
2. Create database: `prism_ai_db`
3. Note the Database ID

### 2.2 Collection: user_profiles
**Collection ID**: `user_profiles`

**Attributes**:
- `userId` (String, 255, Required, Unique)
- `displayName` (String, 255, Optional)
- `email` (String, 255, Optional)
- `completedOnboarding` (Boolean, Default: false)
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes**:
- `userId_index`: Key on `userId`
- `email_index`: Key on `email`
- `updated_index`: Key on `updatedAt`

**Permissions**:
- Read: `users`
- Write: `users`
- Document-level security: Enable

### 2.3 Collection: quiz_responses
**Collection ID**: `quiz_responses`

**Attributes**:
- `userId` (String, 255, Required)
- `skincare` (JSON, Required)
- `clothing` (JSON, Required)
- `rawAnswers` (JSON, Required)
- `version` (String, 10, Default: "1.0")
- `createdAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes**:
- `userId_index`: Key on `userId`
- `user_updated_index`: Key on `userId` + `updatedAt` (DESC)
- `created_index`: Key on `createdAt`

**Permissions**:
- Read: `users`
- Write: `users`
- Document-level security: Enable

### 2.4 Collection: chat_sessions
**Collection ID**: `chat_sessions`

**Attributes**:
- `userId` (String, 255, Required)
- `title` (String, 255, Optional)
- `startedAt` (DateTime, Required)
- `updatedAt` (DateTime, Required)

**Indexes**:
- `userId_index`: Key on `userId`
- `user_updated_index`: Key on `userId` + `updatedAt` (DESC)

**Permissions**:
- Read: `users`
- Write: `users`
- Document-level security: Enable

### 2.5 Collection: chat_messages
**Collection ID**: `chat_messages`

**Attributes**:
- `userId` (String, 255, Required)
- `sessionId` (String, 255, Required)
- `role` (String, 20, Required) // "user" or "assistant"
- `text` (String, 10000, Required)
- `imageFileId` (String, 255, Optional)
- `products` (JSON, Optional)
- `outfits` (JSON, Optional)
- `createdAt` (DateTime, Required)

**Indexes**:
- `session_index`: Key on `sessionId`
- `user_created_index`: Key on `userId` + `createdAt` (ASC)
- `created_index`: Key on `createdAt`

**Permissions**:
- Read: `users`
- Write: `users`
- Document-level security: Enable

## Step 3: Storage Setup (Optional)

### 3.1 Create Bucket
1. Go to Storage
2. Create bucket: `chat-uploads`
3. Set file size limit: 10MB
4. Allowed file extensions: `jpg,jpeg,png,gif,webp`
5. Permissions:
   - Read: `users`
   - Write: `users`

## Step 4: Environment Variables

Create `.env` file for your Appwrite Function:

```env
GEMINI_API_KEY=your_gemini_api_key_here
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id_here
APPWRITE_API_KEY=your_api_key_here
DATABASE_ID=prism_ai_db
USER_PROFILES_COLLECTION_ID=user_profiles
QUIZ_RESPONSES_COLLECTION_ID=quiz_responses
CHAT_SESSIONS_COLLECTION_ID=chat_sessions
CHAT_MESSAGES_COLLECTION_ID=chat_messages
CHAT_UPLOADS_BUCKET_ID=chat-uploads
```

## Next Steps

1. Complete the Appwrite setup using this guide
2. Install Appwrite SDK in your project
3. Create the Appwrite Function for Gemini integration
4. Update your frontend code to use Appwrite

**Important Security Notes**:
- Never expose API keys in frontend code
- Use JWT tokens for user authentication
- Enable document-level security for all collections
- Validate all inputs in Appwrite Functions