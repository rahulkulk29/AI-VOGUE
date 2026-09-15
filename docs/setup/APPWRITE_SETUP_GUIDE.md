# AI VOGUE - Appwrite Setup Guide

Complete step-by-step instructions to set up Appwrite backend for your AI VOGUE website.

---

## 📋 Table of Contents
1. [Create Appwrite Account](#1-create-appwrite-account)
2. [Create New Project](#2-create-new-project)
3. [Configure Authentication](#3-configure-authentication)
4. [Create Database](#4-create-database)
5. [Create Collections](#5-create-collections)
6. [Create Storage Bucket](#6-create-storage-bucket)
7. [Update Configuration](#7-update-configuration)
8. [Testing](#8-testing)

---

## 1. Create Appwrite Account

1. Go to [Appwrite Cloud](https://cloud.appwrite.io/)
2. Click **"Sign Up"** or **"Get Started"**
3. Create account using:
   - Email and password, OR
   - GitHub, OR
   - Google
4. Verify your email if required

---

## 2. Create New Project

1. After login, click **"Create Project"**
2. Enter Project Details:
   - **Name**: `AI-VOGUE` (or your preferred name)
   - **Project ID**: Auto-generated (copy this, you'll need it later)
3. Click **"Create"**
4. You'll be redirected to the project dashboard

### Copy Important IDs
- **Project ID**: Found at the top of the dashboard
- **Endpoint**: `https://cloud.appwrite.io/v1` (default for Appwrite Cloud)

---

## 3. Configure Authentication

### 3.1 Enable Email/Password Authentication
1. In the left sidebar, click **"Auth"**
2. Click **"Settings"** tab
3. Under **"Auth Methods"**, enable:
   - ✅ **Email/Password**
4. Click **"Update"**

### 3.2 Configure Session Settings
1. Stay in Auth → Settings
2. Set **Session Length**: `31536000` (1 year in seconds)
3. Enable **"Allow users to create accounts"**
4. Click **"Update"**

### 3.3 Add Your Domain (Important!)
1. Go to **"Settings"** → **"Platforms"**
2. Click **"Add Platform"** → **"Web App"**
3. Enter:
   - **Name**: `AI VOGUE Website`
   - **Hostname**: `localhost` (for local development)
   - **Port**: (leave empty or enter your dev port like `5500`)
4. Click **"Next"** → **"Skip Optional"**
5. **For Production**: Add your live domain (e.g., `aivogue.com`)

---

## 4. Create Database

1. In the left sidebar, click **"Databases"**
2. Click **"Create Database"**
3. Enter:
   - **Database ID**: `ai-vogue-db` (or auto-generate)
   - **Name**: `AI VOGUE Database`
4. Click **"Create"**
5. **Copy the Database ID** - you'll need this!

---

## 5. Create Collections

You need to create **4 collections**: Users, Orders, Wishlist, and Addresses.

### 5.1 Users Collection

1. Click **"Create Collection"**
2. Enter:
   - **Collection ID**: `users` (or auto-generate)
   - **Name**: `Users`
3. Click **"Create"**

#### Add Attributes (Click "Create Attribute"):

| Attribute Key | Type     | Size | Required | Default | Array |
|--------------|----------|------|----------|---------|-------|
| `userId`     | String   | 255  | ✅       | -       | ❌    |
| `firstName`  | String   | 100  | ✅       | -       | ❌    |
| `lastName`   | String   | 100  | ✅       | -       | ❌    |
| `email`      | Email    | 320  | ✅       | -       | ❌    |
| `phone`      | String   | 20   | ❌       | -       | ❌    |
| `avatar`     | URL      | 2000 | ❌       | -       | ❌    |
| `membershipTier` | String | 50 | ❌   | `Silver` | ❌    |
| `rewardPoints` | Integer | -  | ❌       | `0`     | ❌    |
| `newsletter` | Boolean  | -    | ❌       | `true`  | ❌    |
| `createdAt`  | DateTime | -    | ❌       | -       | ❌    |

#### Set Permissions:
1. Click **"Settings"** tab in Users collection
2. Under **"Permissions"**, click **"Add Role"**
3. Add these permissions:
   - **Create**: `Users`
   - **Read**: `Users` (for own data)
   - **Update**: `Users` (for own data)
   - **Delete**: `Users` (for own data)

---

### 5.2 Orders Collection

1. Go back to database, click **"Create Collection"**
2. Enter:
   - **Collection ID**: `orders` (or auto-generate)
   - **Name**: `Orders`
3. Click **"Create"**

#### Add Attributes:

| Attribute Key | Type     | Size | Required | Default | Array |
|--------------|----------|------|----------|---------|-------|
| `userId`     | String   | 255  | ✅       | -       | ❌    |
| `orderId`    | String   | 100  | ✅       | -       | ❌    |
| `status`     | String   | 50   | ✅       | `Processing` | ❌ |
| `itemCount`  | Integer  | -    | ✅       | -       | ❌    |
| `total`      | Float    | -    | ✅       | -       | ❌    |
| `items`      | String   | 10000| ❌       | -       | ✅    |

#### Set Permissions:
- **Create**: `Users`
- **Read**: `Users` (own orders only)
- **Update**: `Admin` (only admins can update)
- **Delete**: `Admin`

---

### 5.3 Wishlist Collection

1. Click **"Create Collection"**
2. Enter:
   - **Collection ID**: `wishlist` (or auto-generate)
   - **Name**: `Wishlist`
3. Click **"Create"**

#### Add Attributes:

| Attribute Key   | Type     | Size | Required | Default | Array |
|----------------|----------|------|----------|---------|-------|
| `userId`       | String   | 255  | ✅       | -       | ❌    |
| `productId`    | String   | 255  | ✅       | -       | ❌    |
| `productName`  | String   | 255  | ✅       | -       | ❌    |
| `productPrice` | Float    | -    | ✅       | -       | ❌    |
| `productImage` | URL      | 2000 | ✅       | -       | ❌    |
| `addedAt`      | DateTime | -    | ✅       | -       | ❌    |

#### Set Permissions:
- **Create**: `Users`
- **Read**: `Users` (own wishlist)
- **Update**: `Users`
- **Delete**: `Users`

---

### 5.4 Addresses Collection

1. Click **"Create Collection"**
2. Enter:
   - **Collection ID**: `addresses` (or auto-generate)
   - **Name**: `Addresses`
3. Click **"Create"**

#### Add Attributes:

| Attribute Key | Type     | Size | Required | Default | Array |
|--------------|----------|------|----------|---------|-------|
| `userId`     | String   | 255  | ✅       | -       | ❌    |
| `name`       | String   | 255  | ✅       | -       | ❌    |
| `street`     | String   | 500  | ✅       | -       | ❌    |
| `city`       | String   | 100  | ✅       | -       | ❌    |
| `state`      | String   | 100  | ✅       | -       | ❌    |
| `zipCode`    | String   | 20   | ✅       | -       | ❌    |
| `country`    | String   | 100  | ✅       | -       | ❌    |
| `phone`      | String   | 20   | ✅       | -       | ❌    |
| `isDefault`  | Boolean  | -    | ❌       | `false` | ❌    |
| `createdAt`  | DateTime | -    | ✅       | -       | ❌    |

#### Set Permissions:
- **Create**: `Users`
- **Read**: `Users` (own addresses)
- **Update**: `Users`
- **Delete**: `Users`

---

## 6. Create Storage Bucket

For profile pictures and product images.

1. In left sidebar, click **"Storage"**
2. Click **"Create Bucket"**
3. Enter:
   - **Bucket ID**: `avatars` (or auto-generate)
   - **Name**: `Profile Avatars`
   - **Max File Size**: `10MB` (10485760 bytes)
   - **Allowed File Extensions**: `jpg, jpeg, png, gif, webp`
4. Click **"Create"**

#### Set Permissions:
1. Click on the bucket
2. Go to **"Settings"** → **"Permissions"**
3. Add:
   - **Create**: `Users`
   - **Read**: `Any` (public read for avatars)
   - **Update**: `Users`
   - **Delete**: `Users`

---

## 7. Update Configuration

### 7.1 Collect All IDs

You should now have:
- ✅ **Project ID**: From project dashboard
- ✅ **Database ID**: From database page
- ✅ **Users Collection ID**: From users collection
- ✅ **Orders Collection ID**: From orders collection
- ✅ **Wishlist Collection ID**: From wishlist collection
- ✅ **Addresses Collection ID**: From addresses collection
- ✅ **Bucket ID**: From storage bucket

### 7.2 Update appwrite-config.js

1. Open `js/appwrite-config.js`
2. Replace the configuration:

```javascript
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1',
    projectId: 'YOUR_PROJECT_ID_HERE',           // ← Replace
    databaseId: 'YOUR_DATABASE_ID_HERE',         // ← Replace
    collections: {
        users: 'YOUR_USERS_COLLECTION_ID',       // ← Replace
        orders: 'YOUR_ORDERS_COLLECTION_ID',     // ← Replace
        wishlist: 'YOUR_WISHLIST_COLLECTION_ID', // ← Replace
        addresses: 'YOUR_ADDRESSES_COLLECTION_ID'// ← Replace
    },
    bucketId: 'YOUR_BUCKET_ID_HERE'              // ← Replace
};
```

3. Save the file

---

## 8. Testing

### 8.1 Test Registration

1. Start your local development server
2. Go to `login.html`
3. Switch to **"Create Account"** tab
4. Fill in:
   - First Name: `Test`
   - Last Name: `User`
   - Email: `test@aivogue.com`
   - Password: `Test12345!`
   - Confirm Password: `Test12345!`
   - ✅ Agree to terms
5. Click **"Create Account"**
6. Should redirect to `profile.html`

### 8.2 Verify in Appwrite

1. Go to Appwrite Dashboard
2. Click **"Auth"** → **"Users"**
3. You should see the new user: `Test User`
4. Click **"Databases"** → Your database → **"Users"** collection
5. You should see a document with the user's profile data

### 8.3 Test Login

1. Log out (click Sign Out button in profile)
2. Go back to `login.html`
3. Enter:
   - Email: `test@aivogue.com`
   - Password: `Test12345!`
4. Click **"Sign In"**
5. Should redirect to profile page

### 8.4 Test Profile Features

1. On profile page, click each button:
   - **Profile Information**: Shows your details
   - **My Orders**: Empty state (no orders yet)
   - **Wishlist**: Empty state
   - **Edit Profile**: Can update name, phone, newsletter
   - **Saved Addresses**: Empty state
   - **Privacy Center**: Toggle privacy settings

---

## 🎉 Congratulations!

Your AI VOGUE website is now connected to Appwrite!

### Next Steps:

1. **Add Test Data**:
   - Create some test orders in Appwrite dashboard
   - Add wishlist items
   - Add test addresses

2. **Customize**:
   - Update membership tiers logic
   - Add reward points calculation
   - Implement order tracking

3. **Production**:
   - Add your production domain in Appwrite
   - Enable email verification
   - Set up email templates
   - Configure OAuth providers (Google, Apple, Facebook)

---

## 🔧 Troubleshooting

### Error: "Project not found"
- ✅ Check `projectId` in `appwrite-config.js`
- ✅ Verify domain is added in Appwrite → Settings → Platforms

### Error: "Collection not found"
- ✅ Verify all collection IDs are correct
- ✅ Check collection permissions are set

### Error: "User unauthorized"
- ✅ Check collection permissions include `Users` role
- ✅ Verify user is logged in

### Login/Registration Not Working
- ✅ Check browser console for errors
- ✅ Verify Email/Password auth is enabled
- ✅ Check network tab for failed API calls

---

## 📚 Additional Resources

- [Appwrite Documentation](https://appwrite.io/docs)
- [Appwrite Web SDK](https://appwrite.io/docs/sdks#web)
- [Appwrite Discord Community](https://appwrite.io/discord)

---

## 🤝 Support

If you encounter issues:
1. Check the browser console for error messages
2. Verify all IDs in `appwrite-config.js`
3. Ensure collections have proper permissions
4. Check Appwrite logs in dashboard

---

**Built with ❤️ for AI VOGUE**
