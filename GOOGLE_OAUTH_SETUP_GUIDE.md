# Google OAuth Setup Guide

To make the Google Login button work, you need to configure settings in two places: **Google Cloud Console** and **Appwrite Console**.

## 1. Google Cloud Console (Get Credentials)

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project or select an existing one.
3. Navigate to **APIs & Services** > **Credentials**.
4. Click **Create Credentials** > **OAuth client ID**.
5. Select **Web application**.
6. **Important:** In the **"Authorized redirect URIs"** field, paste exactly this URL:
   ```
   https://nyc.cloud.appwrite.io/v1/account/sessions/oauth2/callback/google/68dd18860033ab7dffac
   ```
   *(This is the URL you provided)*
7. Click **Create**.
8. Copy the **Client ID** and **Client Secret**.
   *(Note: `rahulkulk@29` does not look like a standard Google Client Secret. A real secret usually looks like `GOCSPX-xxxxxxxx...`. Please double check this!)*

## 2. Appwrite Console (Connect)

1. Go to your [Appwrite Console](https://cloud.appwrite.io/console).
2. Click on your project **AI VOGUE**.
3. In the left sidebar, click **Auth**.
4. Click on the **Settings** tab (or "Security" in some versions).
5. Scroll down to **OAuth2 Providers**.
6. Find **Google** and click the toggle to enable it.
7. Paste the **App ID** (Client ID from Google).
8. Paste the **App Secret** (Client Secret from Google).
9. Click **Update**.

## ✅ That's it!

Once you do this, the "Continue with Google" button on your login page will work automatically. You do **not** need to change any code in the files.
