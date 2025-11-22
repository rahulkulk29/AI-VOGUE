# 🚀 Quick Start Guide - Custom Fashion Marketplace

## Get Up and Running in 30 Minutes

This guide will help you get the Custom Fashion Designer Marketplace running locally for testing and development.

---

## Prerequisites

- ✅ Appwrite Cloud account (or self-hosted instance)
- ✅ Stripe account (India region)
- ✅ Modern web browser
- ✅ Code editor (VS Code recommended)

---

## Step 1: Configure Appwrite (10 minutes)

### 1.1 Create Project

1. Go to [cloud.appwrite.io](https://cloud.appwrite.io)
2. Click "Create Project"
3. Name: `AI VOGUE Custom Fashion`
4. Copy your **Project ID**

### 1.2 Add Platform

1. Go to **Settings** → **Platforms**
2. Click **Add Platform** → **Web App**
3. Name: `AI VOGUE Website`
4. Hostname: `localhost` (for development)
5. Click **Add**

### 1.3 Create Database

1. Go to **Databases**
2. Click **Create Database**
3. Database ID: `custom_fashion_db`
4. Name: `Custom Fashion Database`

### 1.4 Import Collections

**Option A: Manual (Recommended for learning)**

Create these collections manually in Appwrite Console:

1. `users` - User profiles
2. `designer_profiles` - Designer data
3. `custom_requests` - Customer requests
4. `quotes` - Designer quotes
5. `orders` - Active orders
6. `order_assets` - Deliverables
7. `messages` - Order messages
8. `reviews` - Customer reviews
9. `transactions` - Payment logs

Refer to `appwrite/collections.json` for exact schema.

**Option B: CLI (Faster)**

```bash
# Install Appwrite CLI
npm install -g appwrite-cli

# Login
appwrite login

# Import collections (coming soon - manual for now)
```

### 1.5 Create Storage Buckets

1. Go to **Storage**
2. Create three buckets:

**Bucket 1: request_images**
- ID: `request_images`
- Max File Size: `104857600` (100MB)
- Allowed Extensions: `jpg,jpeg,png,pdf`
- Permissions: Read: `any`, Create: `role:customer`

**Bucket 2: deliverables**
- ID: `deliverables`
- Max File Size: `104857600` (100MB)
- Allowed Extensions: `jpg,jpeg,png,pdf,psd,ai,zip`
- Permissions: Read: `owner`, Create: `role:designer`

**Bucket 3: thumbnails**
- ID: `thumbnails`
- Max File Size: `5242880` (5MB)
- Allowed Extensions: `jpg,jpeg,png,webp`
- Permissions: Read: `any`, Create: `any`

---

## Step 2: Configure Frontend (5 minutes)

### 2.1 Update Configuration

Open `assets/custom-fash.js` and update:

```javascript
// Line 10-12
const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1', // Your Appwrite endpoint
  project: 'YOUR_PROJECT_ID_HERE', // Replace with your Project ID
  databaseId: 'custom_fashion_db',
  // ... rest is pre-configured
};
```

### 2.2 Get Stripe Test Key

1. Go to [stripe.com](https://stripe.com) and create account
2. Go to **Developers** → **API Keys**
3. Copy **Publishable key** (starts with `pk_test_`)

Update in `assets/custom-fash.js`:

```javascript
// Line 50-54
const stripeConfig = {
  publishableKey: 'pk_test_YOUR_KEY_HERE', // Replace with your key
  currency: 'inr',
  country: 'IN'
};
```

---

## Step 3: Test Locally (5 minutes)

### 3.1 Serve Files

**Option A: VS Code Live Server**
1. Install "Live Server" extension
2. Right-click `custom-marketplace.html`
3. Click "Open with Live Server"

**Option B: Python**
```bash
cd e:\Projects\website_v5\website_v5\frontend\public\creative-threads\custom-fashion
python -m http.server 8000
# Open http://localhost:8000/custom-marketplace.html
```

**Option C: Node.js**
```bash
npx serve .
# Open http://localhost:3000/custom-marketplace.html
```

### 3.2 Create Test Account

1. Open the marketplace page
2. Click "Post Custom Request"
3. You'll be redirected to login (if not logged in)
4. Create account:
   - Email: `customer@test.com`
   - Password: `password123`
   - Name: `Test Customer`

---

## Step 4: Deploy Appwrite Functions (10 minutes)

### 4.1 Install Dependencies

```bash
cd appwrite/functions/onQuoteAccepted
npm install

cd ../webhookStripe
npm install
```

### 4.2 Create Functions in Appwrite Console

**Function 1: onQuoteAccepted**

1. Go to **Functions** → **Create Function**
2. Name: `onQuoteAccepted`
3. Runtime: `Node.js 18`
4. Entrypoint: `src/index.js`
5. Execute Access: `role:customer`, `role:admin`

**Environment Variables:**
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=custom_fashion_db
STRIPE_SECRET_KEY=sk_test_your_key
PLATFORM_FEE_PERCENT=5.5
FRONTEND_URL=http://localhost:8000
```

6. Deploy: Upload `onQuoteAccepted` folder

**Function 2: webhookStripe**

1. Go to **Functions** → **Create Function**
2. Name: `webhookStripe`
3. Runtime: `Node.js 18`
4. Entrypoint: `src/index.js`
5. Execute Access: `any` (public webhook)

**Environment Variables:**
```
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key
DATABASE_ID=custom_fashion_db
STRIPE_SECRET_KEY=sk_test_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
```

6. Deploy: Upload `webhookStripe` folder

### 4.3 Configure Stripe Webhook

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Click **Add endpoint**
3. Endpoint URL: `https://cloud.appwrite.io/v1/functions/webhookStripe/executions`
4. Events: Select `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`
5. Copy **Signing secret** and add to function environment variables

---

## Step 5: Test End-to-End (5 minutes)

### 5.1 Post a Request

1. Go to `custom-marketplace.html`
2. Click "Post Custom Request"
3. Fill in:
   - Title: "Custom Wedding Lehenga"
   - Description: "Traditional red and gold lehenga with heavy embroidery"
   - Occasion: Wedding
   - Budget: ₹10,000 - ₹25,000
   - Upload 1-2 reference images
4. Click "Post Request"

### 5.2 Verify in Appwrite

1. Go to Appwrite Console → **Databases** → `custom_fashion_db` → `custom_requests`
2. You should see your request!

### 5.3 Test Filters

1. Go back to marketplace
2. Try filtering by occasion and budget
3. Your request should appear/disappear based on filters

---

## 🎉 Success!

You now have a working Custom Fashion Marketplace! 

### What Works:
- ✅ Browse requests
- ✅ Post requests with images
- ✅ File upload with validation
- ✅ Filters (occasion, budget)
- ✅ Responsive design

### What's Next:
- Build remaining pages (request-detail, designer-dashboard, order, etc.)
- Implement remaining Appwrite Functions
- Test quote acceptance and payment flow
- Deploy to production

---

## 🐛 Troubleshooting

### Issue: "Appwrite SDK not loaded"
**Solution:** Make sure you're serving files via HTTP (not opening file:// directly)

### Issue: "User not authenticated"
**Solution:** Create an account first via Appwrite Auth

### Issue: "File upload fails"
**Solution:** Check storage bucket permissions and file size limits

### Issue: "Request not appearing"
**Solution:** Check browser console for errors, verify Appwrite permissions

---

## 📚 Next Steps

1. **Read Documentation:**
   - `README.md` - Complete setup guide
   - `PROJECT_PACKAGE.md` - Project overview
   - `IMPLEMENTATION_SUMMARY.md` - Technical details

2. **Build Remaining Pages:**
   - `request-detail.html`
   - `designer-dashboard.html`
   - `order.html`
   - `designer-profile.html`
   - `admin-dashboard.html`

3. **Implement Functions:**
   - `onDeliverableUploaded`
   - `onOrderCompleted`
   - `validateUpload`
   - `refundOrDispute`
   - `sendNotification`

4. **Test Payment Flow:**
   - Accept quote
   - Stripe Checkout
   - Webhook handling
   - Order creation

---

## 💡 Tips

- **Use Test Cards:** `4000 0035 6000 0008` for successful payment
- **Check Logs:** Appwrite Console → Functions → Executions
- **Debug:** Browser DevTools → Console for errors
- **Test Mobile:** Use browser DevTools → Device Mode

---

## 📞 Need Help?

- **Documentation:** See README.md
- **Appwrite Docs:** https://appwrite.io/docs
- **Stripe Docs:** https://stripe.com/docs/india
- **Issues:** Check browser console and Appwrite logs

---

**Happy Building! 🚀**

*Last Updated: November 21, 2024*
