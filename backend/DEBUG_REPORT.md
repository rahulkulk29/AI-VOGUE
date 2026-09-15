# Prism AI Debug Report

## Issue Identified
The chat feature is failing with a **500 Internal Server Error**.

## Root Cause
The **Groq API Key** configured in `backend/.env` is invalid.
- The backend attempts to connect to Groq API (`https://api.groq.com/openai/v1/chat/completions`).
- The API returns **401 Unauthorized** (Invalid API Key).
- This causes the backend to throw an error, resulting in the 500 response to the frontend.

## Verification
I ran a test script (`test-groq.js`) using the key found in your environment, and it confirmed the 401 error:
```
FAILED: 401
Body: {"error":{"message":"Invalid ...","code":"invalid_api_key"}}
```

## Secondary Issue (Non-Blocking)
The Appwrite error (`User (role: guests) missing scopes`) is due to the user not being logged in. The system correctly handles this by using a temporary profile, so this is **not** blocking the chat.

## Solution Required
Please provide a valid **Groq API Key**.
You can get a free key from [Groq Console](https://console.groq.com/keys).

Once provided, I will:
1. Update `backend/.env` with the new key.
2. Restart the backend server.
3. Verify the chat works.
