# AI VOGUE - Quick Start Checklist ✅

Follow these steps in order to get your profile system working!

---

## 📋 Pre-Setup (5 minutes)

- [ ] **1.1** Open `APPWRITE_SETUP_GUIDE.md` in a separate tab
- [ ] **1.2** Have your code editor ready
- [ ] **1.3** Have a web browser open

---

## 🔐 Appwrite Account Setup (10 minutes)

- [ ] **2.1** Go to [cloud.appwrite.io](https://cloud.appwrite.io/)
- [ ] **2.2** Create account (Email or GitHub/Google)
- [ ] **2.3** Verify email if prompted
- [ ] **2.4** Click "Create Project"
- [ ] **2.5** Name it: `AI-VOGUE`
- [ ] **2.6** ✏️ **COPY & SAVE** → **Project ID**

---

## ⚙️ Project Configuration (5 minutes)

- [ ] **3.1** Go to **Auth** → **Settings**
- [ ] **3.2** Enable **"Email/Password"**
- [ ] **3.3** Enable **"Allow users to create accounts"**
- [ ] **3.4** Go to **Settings** → **Platforms**
- [ ] **3.5** Add **Web Platform**:
  - Name: `AI VOGUE Website`
  - Hostname: `localhost`
- [ ] **3.6** Click **Save**

---

## 🗄️ Database Setup (15 minutes)

### Create Database
- [ ] **4.1** Go to **Databases**
- [ ] **4.2** Click **"Create Database"**
- [ ] **4.3** Name it: `AI VOGUE Database`
- [ ] **4.4** ✏️ **COPY & SAVE** → **Database ID**

### Create Collections (Do this 4 times!)

#### Collection 1: Users
- [ ] **4.5** Click **"Create Collection"** → Name: `Users`
- [ ] **4.6** ✏️ **COPY & SAVE** → **Users Collection ID**
- [ ] **4.7** Add 10 attributes (see guide for details):
  - [ ] userId (String, 255)
  - [ ] firstName (String, 100)
  - [ ] lastName (String, 100)
  - [ ] email (Email, 320)
  - [ ] phone (String, 20)
  - [ ] avatar (URL, 2000)
  - [ ] membershipTier (String, 50, default: "Silver")
  - [ ] rewardPoints (Integer, default: 0)
  - [ ] newsletter (Boolean, default: true)
  - [ ] createdAt (DateTime)
- [ ] **4.8** Go to **Settings** → **Permissions** → Add:
  - Create, Read, Update, Delete: `Users`

#### Collection 2: Orders
- [ ] **4.9** Click **"Create Collection"** → Name: `Orders`
- [ ] **4.10** ✏️ **COPY & SAVE** → **Orders Collection ID**
- [ ] **4.11** Add 6 attributes:
  - [ ] userId (String, 255)
  - [ ] orderId (String, 100)
  - [ ] status (String, 50, default: "Processing")
  - [ ] itemCount (Integer)
  - [ ] total (Float)
  - [ ] items (String, 10000, Array: Yes)
- [ ] **4.12** Set permissions:
  - Create, Read: `Users`
  - Update, Delete: `Admin`

#### Collection 3: Wishlist
- [ ] **4.13** Click **"Create Collection"** → Name: `Wishlist`
- [ ] **4.14** ✏️ **COPY & SAVE** → **Wishlist Collection ID**
- [ ] **4.15** Add 6 attributes:
  - [ ] userId (String, 255)
  - [ ] productId (String, 255)
  - [ ] productName (String, 255)
  - [ ] productPrice (Float)
  - [ ] productImage (URL, 2000)
  - [ ] addedAt (DateTime)
- [ ] **4.16** Set permissions:
  - Create, Read, Update, Delete: `Users`

#### Collection 4: Addresses
- [ ] **4.17** Click **"Create Collection"** → Name: `Addresses`
- [ ] **4.18** ✏️ **COPY & SAVE** → **Addresses Collection ID**
- [ ] **4.19** Add 10 attributes:
  - [ ] userId (String, 255)
  - [ ] name (String, 255)
  - [ ] street (String, 500)
  - [ ] city (String, 100)
  - [ ] state (String, 100)
  - [ ] zipCode (String, 20)
  - [ ] country (String, 100)
  - [ ] phone (String, 20)
  - [ ] isDefault (Boolean, default: false)
  - [ ] createdAt (DateTime)
- [ ] **4.20** Set permissions:
  - Create, Read, Update, Delete: `Users`

---

## 📦 Storage Setup (5 minutes)

- [ ] **5.1** Go to **Storage**
- [ ] **5.2** Click **"Create Bucket"**
- [ ] **5.3** Name: `Profile Avatars`
- [ ] **5.4** Max File Size: `10485760` (10MB)
- [ ] **5.5** Allowed Extensions: `jpg,jpeg,png,gif,webp`
- [ ] **5.6** ✏️ **COPY & SAVE** → **Bucket ID**
- [ ] **5.7** Set permissions:
  - Create, Update, Delete: `Users`
  - Read: `Any`

---

## 💻 Code Configuration (3 minutes)

- [ ] **6.1** Open `js/appwrite-config.js` in your editor
- [ ] **6.2** Find the `APPWRITE_CONFIG` object
- [ ] **6.3** Replace **ALL** placeholder values with your saved IDs:

```javascript
const APPWRITE_CONFIG = {
    endpoint: 'https://cloud.appwrite.io/v1', // ← Keep this
    projectId: 'PASTE_YOUR_PROJECT_ID_HERE',
    databaseId: 'PASTE_YOUR_DATABASE_ID_HERE',
    collections: {
        users: 'PASTE_YOUR_USERS_COLLECTION_ID_HERE',
        orders: 'PASTE_YOUR_ORDERS_COLLECTION_ID_HERE',
        wishlist: 'PASTE_YOUR_WISHLIST_COLLECTION_ID_HERE',
        addresses: 'PASTE_YOUR_ADDRESSES_COLLECTION_ID_HERE'
    },
    bucketId: 'PASTE_YOUR_BUCKET_ID_HERE'
};
```

- [ ] **6.4** Save the file

---

## 🧪 Testing (10 minutes)

### Start Server
- [ ] **7.1** Start your local web server
  - VS Code: Right-click `index.html` → Open with Live Server
  - OR: Use your preferred method

### Test Registration
- [ ] **7.2** Open browser → go to `login.html`
- [ ] **7.3** Click **"Create Account"** tab
- [ ] **7.4** Fill in test user:
  - First Name: `Test`
  - Last Name: `User`
  - Email: `test@aivogue.com`
  - Password: `Test12345!`
  - ✅ Agree to terms
- [ ] **7.5** Click **"Create Account"**
- [ ] **7.6** Should redirect to `profile.html` ✅

### Verify in Appwrite
- [ ] **7.7** Go to Appwrite Dashboard
- [ ] **7.8** Click **Auth** → **Users**
- [ ] **7.9** You should see: `Test User` with email `test@aivogue.com` ✅

### Test Login
- [ ] **7.10** Click **"Sign Out"** on profile page
- [ ] **7.11** Go to `login.html`
- [ ] **7.12** Enter:
  - Email: `test@aivogue.com`
  - Password: `Test12345!`
- [ ] **7.13** Click **"Sign In"**
- [ ] **7.14** Should see profile page with your name ✅

### Test Profile Features
- [ ] **7.15** Click **"Profile Information"** → Modal opens ✅
- [ ] **7.16** Close modal → Click **"My Orders"** → Shows empty state ✅
- [ ] **7.17** Click **"Wishlist"** → Shows empty state ✅
- [ ] **7.18** Click **"Edit Profile"**:
  - [ ] Change phone to: `+1 (555) 123-4567`
  - [ ] Click **"Save Changes"**
  - [ ] Should show success message ✅
- [ ] **7.19** Click **"Saved Addresses"** → Shows empty state ✅
- [ ] **7.20** Click **"Privacy Center"** → Shows toggles ✅

### Test Account Icon
- [ ] **7.21** Click AI VOGUE logo → go to home page
- [ ] **7.22** Click hamburger menu → Click **Account icon (👤)**
- [ ] **7.23** Should go to profile page ✅

---

## ✅ Success Criteria

You're done when:
- ✅ Can register new account
- ✅ Can login with account
- ✅ Profile page loads with user data
- ✅ All 6 modals open and display correctly
- ✅ Can edit profile and save changes
- ✅ Account icon links to profile
- ✅ Can sign out and sign back in

---

## 🎉 Congratulations!

Your AI VOGUE profile system is live!

### What You Now Have:
- ✅ Full authentication system
- ✅ Beautiful Gucci-style profile page
- ✅ 6 profile management sections
- ✅ Appwrite backend integration
- ✅ Secure user data storage
- ✅ Responsive mobile design

---

## 🚀 Next Steps

1. **Explore Features**:
   - Upload a profile picture
   - Update your information
   - Test all modals

2. **Customize**:
   - Add your own colors/branding
   - Customize membership tiers
   - Add reward point logic

3. **Go Live**:
   - Add production domain to Appwrite
   - Enable email verification
   - Set up OAuth providers

---

## 🐛 If Something Doesn't Work

1. **Check Browser Console** (F12 → Console tab)
   - Look for red error messages
   - Common: "Collection not found" → Check IDs

2. **Verify All IDs**:
   - Open `js/appwrite-config.js`
   - Compare with Appwrite dashboard
   - Make sure no "YOUR_" placeholders remain

3. **Check Permissions**:
   - Each collection must have `Users` permission
   - Go to collection → Settings → Permissions

4. **Clear Cache**:
   - Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
   - Or use incognito/private window

5. **Check Domain**:
   - Appwrite → Settings → Platforms
   - Must have `localhost` added

---

## 📚 Reference Documents

- `APPWRITE_SETUP_GUIDE.md` - Detailed setup instructions
- `README_PROFILE_SYSTEM.md` - Complete system overview
- Appwrite Docs - [appwrite.io/docs](https://appwrite.io/docs)

---

## ⏱️ Total Time: ~45 minutes

- Appwrite Setup: 35 min
- Code Config: 3 min
- Testing: 10 min

**Don't rush! Take your time to set up correctly.**

---

**Happy Coding! 🚀**
**Built for AI VOGUE with ❤️**
