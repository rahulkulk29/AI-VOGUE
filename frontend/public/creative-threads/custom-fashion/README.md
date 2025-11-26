# Custom Fashion Designer Marketplace - Setup Guide

## 🎯 Overview

A production-ready custom fashion designer marketplace feature for AI VOGUE. This platform connects customers with designers for custom fashion requests, featuring escrow payments, file deliverables, and secure messaging.

**Target Market:** India  
**Currency:** INR (₹)  
**Payment Gateway:** Stripe  
**Backend:** Appwrite (Auth, Database, Storage, Functions)  
**Platform Fee:** 5.5% (admin adjustable)  
**Free Revisions:** 2 per order

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Appwrite Setup](#appwrite-setup)
3. [Stripe Setup (India)](#stripe-setup-india)
4. [Email Configuration](#email-configuration)
5. [Project Installation](#project-installation)
6. [Environment Variables](#environment-variables)
7. [Deployment](#deployment)
8. [Testing](#testing)
9. [Production Checklist](#production-checklist)
10. [Troubleshooting](#troubleshooting)

---

## 🔧 Prerequisites

- **Appwrite Cloud** account or self-hosted Appwrite instance (v1.4+)
- **Stripe** account (India region)
- **SendGrid** account (or SMTP server for emails)
- **Node.js** 18+ (for Appwrite Functions)
- **Modern browser** (Chrome, Firefox, Safari latest versions)

---

## 🚀 Appwrite Setup

### Step 1: Create Appwrite Project

1. Log in to [Appwrite Cloud](https://cloud.appwrite.io/) or your self-hosted instance
2. Create a new project: **"AI VOGUE Custom Fashion"**
3. Note your **Project ID** and **API Endpoint**

### Step 2: Configure Platform

1. Navigate to **Settings** → **Platforms**
2. Add a **Web App** platform:
   - **Name:** AI VOGUE Website
   - **Hostname:** `localhost` (for development) and your production domain
   - Click **Add**

### Step 3: Import Database Collections

Navigate to **Database** and import the collections from `appwrite/collections.json`:

```bash
# Use Appwrite CLI to import collections
appwrite databases create --databaseId custom_fashion_db --name "Custom Fashion DB"
appwrite collections create --databaseId custom_fashion_db --collectionId users --name "Users" --permissions "read(\"any\")" --documentSecurity true
# ... (repeat for all collections)
```

**Or manually create collections using the Appwrite Console:**

#### Collection: `users` (extends Appwrite Auth)
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| name | string | 255 | Yes | No |
| email | string | 255 | Yes | No |
| phone | string | 15 | No | No |
| role | enum | - | Yes | No |
| verified_designer | boolean | - | No | No |
| bio | string | 2000 | No | No |
| profile_pic | string | 500 | No | No |
| portfolio | string | 500 | No | Yes |
| created_at | datetime | - | Yes | No |

**Enum values for `role`:** `customer`, `designer`, `admin`

#### Collection: `designer_profiles`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| user_id | string | 255 | Yes | No |
| business_name | string | 255 | No | No |
| skills_tags | string | 100 | No | Yes |
| avg_delivery_days | integer | - | No | No |
| approved_at | datetime | - | No | No |
| bank_details_encrypted | string | 1000 | No | No |

#### Collection: `custom_requests`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| customer_id | string | 255 | Yes | No |
| title | string | 255 | Yes | No |
| description | string | 5000 | Yes | No |
| occasion | string | 100 | No | No |
| budget_min | integer | - | Yes | No |
| budget_max | integer | - | Yes | No |
| size_json | string | 1000 | No | No |
| deadline_date | datetime | - | No | No |
| ref_images | string | 500 | No | Yes |
| visibility | enum | - | Yes | No |
| status | enum | - | Yes | No |
| created_at | datetime | - | Yes | No |

**Enum values for `visibility`:** `public`, `invite-only`  
**Enum values for `status`:** `open`, `assigned`, `closed`, `cancelled`

#### Collection: `quotes`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| request_id | string | 255 | Yes | No |
| designer_id | string | 255 | Yes | No |
| price | integer | - | Yes | No |
| delivery_days | integer | - | Yes | No |
| revisions_included | integer | - | Yes | No |
| message | string | 2000 | No | No |
| sample_file | string | 500 | No | No |
| status | enum | - | Yes | No |
| created_at | datetime | - | Yes | No |

**Enum values for `status`:** `sent`, `withdrawn`, `accepted`, `rejected`

#### Collection: `orders`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| quote_id | string | 255 | Yes | No |
| customer_id | string | 255 | Yes | No |
| designer_id | string | 255 | Yes | No |
| amount | integer | - | Yes | No |
| escrow_status | enum | - | Yes | No |
| revision_count_remaining | integer | - | Yes | No |
| status | enum | - | Yes | No |
| created_at | datetime | - | Yes | No |
| completed_at | datetime | - | No | No |

**Enum values for `escrow_status`:** `held`, `released`, `refunded`  
**Enum values for `status`:** `in_progress`, `delivered`, `completed`, `disputed`, `cancelled`

#### Collection: `order_assets`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| order_id | string | 255 | Yes | No |
| uploader_id | string | 255 | Yes | No |
| file_id | string | 255 | Yes | No |
| file_type | string | 50 | Yes | No |
| thumbnail_id | string | 255 | No | No |
| notes | string | 1000 | No | No |
| uploaded_at | datetime | - | Yes | No |

#### Collection: `messages`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| order_id | string | 255 | Yes | No |
| sender_id | string | 255 | Yes | No |
| text | string | 5000 | Yes | No |
| attachments | string | 500 | No | Yes |
| created_at | datetime | - | Yes | No |

#### Collection: `reviews`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| order_id | string | 255 | Yes | No |
| customer_id | string | 255 | Yes | No |
| designer_id | string | 255 | Yes | No |
| rating | integer | - | Yes | No |
| comment | string | 2000 | No | No |
| created_at | datetime | - | Yes | No |

#### Collection: `transactions`
| Attribute | Type | Size | Required | Array |
|-----------|------|------|----------|-------|
| order_id | string | 255 | Yes | No |
| stripe_payment_id | string | 255 | Yes | No |
| amount | integer | - | Yes | No |
| fee_percent | float | - | Yes | No |
| fee_amount | integer | - | Yes | No |
| net_amount | integer | - | Yes | No |
| status | string | 50 | Yes | No |
| created_at | datetime | - | Yes | No |

### Step 4: Configure Permissions

For each collection, set appropriate permissions:

**Example for `custom_requests`:**
- **Create:** `role:customer`, `role:admin`
- **Read:** `any` (for public requests), or `role:designer`, `role:admin`
- **Update:** `owner`, `role:admin`
- **Delete:** `owner`, `role:admin`

### Step 5: Create Storage Buckets

1. Navigate to **Storage**
2. Create buckets:

**Bucket: `request_images`**
- **Name:** Request Reference Images
- **Max File Size:** 100 MB (104857600 bytes)
- **Allowed Extensions:** `jpg`, `jpeg`, `png`, `pdf`
- **Permissions:** Read: `any`, Create: `role:customer`, `role:admin`

**Bucket: `deliverables`**
- **Name:** Order Deliverables
- **Max File Size:** 100 MB
- **Allowed Extensions:** `jpg`, `jpeg`, `png`, `pdf`, `psd`, `ai`, `zip`
- **Permissions:** Read: `owner`, `role:admin`, Create: `role:designer`, `role:admin`

**Bucket: `thumbnails`**
- **Name:** File Thumbnails
- **Max File Size:** 5 MB
- **Allowed Extensions:** `jpg`, `jpeg`, `png`, `webp`
- **Permissions:** Read: `any`, Create: `role:designer`, `role:customer`, `role:admin`

### Step 6: Deploy Appwrite Functions

Navigate to **Functions** and create the following functions:

#### Function: `onQuoteAccepted`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:customer`, `role:admin`
- **Environment Variables:**
  - `STRIPE_SECRET_KEY`: Your Stripe secret key
  - `PLATFORM_FEE_PERCENT`: `5.5`
  - `APPWRITE_ENDPOINT`: Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID`: Your project ID
  - `APPWRITE_API_KEY`: API key with full permissions

Deploy code from `appwrite/functions/onQuoteAccepted/`

#### Function: `webhookStripe`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `any` (public webhook endpoint)
- **Environment Variables:**
  - `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
  - `APPWRITE_ENDPOINT`: Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID`: Your project ID
  - `APPWRITE_API_KEY`: API key with full permissions

Deploy code from `appwrite/functions/webhookStripe/`

#### Function: `onDeliverableUploaded`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:designer`, `role:admin`
- **Environment Variables:**
  - `SENDGRID_API_KEY`: Your SendGrid API key
  - `APPWRITE_ENDPOINT`: Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID`: Your project ID
  - `APPWRITE_API_KEY`: API key with full permissions

Deploy code from `appwrite/functions/onDeliverableUploaded/`

#### Function: `onOrderCompleted`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:customer`, `role:admin`
- **Environment Variables:**
  - `STRIPE_SECRET_KEY`: Your Stripe secret key
  - `APPWRITE_ENDPOINT`: Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID`: Your project ID
  - `APPWRITE_API_KEY`: API key with full permissions

Deploy code from `appwrite/functions/onOrderCompleted/`

#### Function: `refundOrDispute`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:admin`
- **Environment Variables:**
  - `STRIPE_SECRET_KEY`: Your Stripe secret key
  - `APPWRITE_ENDPOINT`: Your Appwrite endpoint
  - `APPWRITE_PROJECT_ID`: Your project ID
  - `APPWRITE_API_KEY`: API key with full permissions

Deploy code from `appwrite/functions/refundOrDispute/`

#### Function: `validateUpload`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:customer`, `role:designer`, `role:admin`

Deploy code from `appwrite/functions/validateUpload/`

#### Function: `sendNotification`
- **Runtime:** Node.js 18
- **Entrypoint:** `src/index.js`
- **Execute Access:** `role:admin`
- **Environment Variables:**
  - `SENDGRID_API_KEY`: Your SendGrid API key
  - `SENDGRID_FROM_EMAIL`: `noreply@aivogue.com`

Deploy code from `appwrite/functions/sendNotification/`

---

## 💳 Stripe Setup (India)

### Step 1: Create Stripe Account

1. Sign up at [Stripe India](https://stripe.com/in)
2. Complete business verification (KYC)
3. Navigate to **Developers** → **API Keys**
4. Copy your **Publishable Key** and **Secret Key** (test mode)

### Step 2: Configure Webhook

1. Navigate to **Developers** → **Webhooks**
2. Click **Add endpoint**
3. **Endpoint URL:** `https://[YOUR_APPWRITE_ENDPOINT]/v1/functions/webhookStripe/executions`
4. **Events to send:**
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
5. Copy the **Webhook Signing Secret**

### Step 3: Test Mode Setup

For testing, use Stripe's test mode:

**Test Cards (India):**
- **Success:** `4000 0035 6000 0008` (Visa - India)
- **Requires Authentication:** `4000 0027 6000 3184` (3D Secure)
- **Declined:** `4000 0000 0000 0002`

**Test UPI VPA:** `success@razorpay` (for UPI testing)

**CVV:** Any 3 digits  
**Expiry:** Any future date  
**ZIP:** Any 6 digits

### Step 4: Production Setup (When Ready)

1. Complete Stripe account activation
2. Switch to **Live mode**
3. Update environment variables with live keys
4. Configure payout schedule (daily/weekly/monthly)
5. Add bank account for payouts (Indian bank account required)

### Step 5: Payout Configuration

**For Escrow Release:**

Stripe supports two methods for releasing funds to designers:

**Option 1: Stripe Connect (Recommended)**
- Set up Stripe Connect with Standard or Express accounts
- Designers create their own Stripe accounts
- Platform automatically transfers funds using `stripe.transfers.create()`

**Option 2: Manual Payouts (Simpler for MVP)**
- Platform holds funds in main Stripe account
- Admin manually processes payouts via bank transfer
- Transaction logs track pending payouts
- Suitable for low-volume initial launch

**This implementation uses Option 2 for simplicity. To upgrade to Option 1:**
1. Enable Stripe Connect in your Stripe dashboard
2. Update `onOrderCompleted` function to use Connect API
3. Add designer onboarding flow for Stripe Connect

---

## 📧 Email Configuration

### Option 1: SendGrid (Recommended)

1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create an API key with **Mail Send** permissions
3. Verify your sender email/domain
4. Update environment variables

### Option 2: SMTP Server

Configure SMTP settings in `appwrite/functions/sendNotification/src/index.js`:

```javascript
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-app-password'
  }
});
```

---

## 📦 Project Installation

### Step 1: Copy Files

Copy all files from this package to your project:

```bash
# Copy frontend files
cp -r custom-fashion/ /path/to/website_v5/frontend/public/creative-threads/

# Copy Appwrite functions
cp -r appwrite/ /path/to/your-appwrite-functions/
```

### Step 2: Update Configuration

Edit `assets/custom-fash.js` and update Appwrite configuration:

```javascript
const appwriteConfig = {
  endpoint: 'https://cloud.appwrite.io/v1', // Your Appwrite endpoint
  project: 'YOUR_PROJECT_ID', // Your Appwrite project ID
  databaseId: 'custom_fashion_db',
  // ... other IDs
};
```

### Step 3: Install Dependencies (for Appwrite Functions)

```bash
cd appwrite/functions/onQuoteAccepted
npm install

cd ../webhookStripe
npm install

# Repeat for all functions
```

---

## 🔐 Environment Variables

Create a `.env` file for Appwrite Functions (or set in Appwrite Console):

```env
# Appwrite
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=your_project_id
APPWRITE_API_KEY=your_api_key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG....
SENDGRID_FROM_EMAIL=noreply@aivogue.com

# Platform Settings
PLATFORM_FEE_PERCENT=5.5
DEFAULT_REVISIONS=2
MAX_FILE_SIZE_MB=100
```

---

## 🚀 Deployment

### Development

1. Open `custom-marketplace.html` in a browser
2. Ensure Appwrite endpoint is accessible
3. Test with Stripe test mode

### Production

1. **Update all API keys to production keys**
2. **Enable HTTPS** (required for Stripe)
3. **Configure CORS** in Appwrite for your production domain
4. **Test payment flow** end-to-end
5. **Set up monitoring** (Appwrite logs, Stripe dashboard)

---

## 🧪 Testing

### Unit Tests

Run unit tests for Appwrite Functions:

```bash
cd tests/
npm install
npm test
```

### End-to-End Test Scenarios

**Scenario 1: Complete Order Flow**
1. Customer creates account → role: `customer`
2. Customer posts request with budget ₹5,000-₹10,000
3. Designer creates account → registers as designer → admin approves
4. Designer sends quote: ₹7,500, 7 days, 2 revisions
5. Customer accepts quote → redirected to Stripe Checkout
6. Customer pays with test card `4000 0035 6000 0008`
7. Payment succeeds → order created with status `in_progress`
8. Designer uploads deliverable (JPG, 5MB)
9. Customer accepts deliverable → order status `completed`
10. Escrow released → transaction logged

**Scenario 2: File Validation**
1. Designer attempts to upload 150MB file → rejected
2. Designer uploads `.exe` file → rejected
3. Designer uploads valid PSD (80MB) → accepted

**Scenario 3: Revision Flow**
1. Customer requests revision (2 remaining)
2. Designer uploads revised file
3. Customer requests another revision (1 remaining)
4. Designer uploads final file
5. Customer accepts → order completed

**Scenario 4: Dispute/Refund**
1. Customer disputes order
2. Admin reviews dispute
3. Admin triggers refund via admin dashboard
4. Stripe refund processed
5. Order status → `refunded`

### Test Checklist

- [ ] User registration (customer, designer)
- [ ] Designer approval workflow
- [ ] Post custom request with images
- [ ] Browse requests (public visibility)
- [ ] Send quote
- [ ] Accept quote → Stripe redirect
- [ ] Stripe payment (test mode)
- [ ] Webhook handling (payment success/failure)
- [ ] File upload (allowed types, size limits)
- [ ] File download (signed URLs)
- [ ] Messaging system
- [ ] Revision requests
- [ ] Order completion
- [ ] Escrow release
- [ ] WhatsApp contact link
- [ ] Admin dashboard (approve designers, refunds)
- [ ] Responsive design (mobile, tablet, desktop)

---

## ✅ Production Checklist

Before going live:

- [ ] All Stripe keys switched to **live mode**
- [ ] Appwrite permissions reviewed and secured
- [ ] HTTPS enabled on all domains
- [ ] CORS configured for production domain
- [ ] SendGrid sender verified
- [ ] Webhook endpoint tested and verified
- [ ] File upload limits enforced
- [ ] Rate limiting enabled
- [ ] Error logging configured
- [ ] Backup strategy in place
- [ ] Legal terms and privacy policy added
- [ ] Customer support contact configured
- [ ] Test all user flows end-to-end
- [ ] Load testing completed
- [ ] Security audit completed

---

## 🐛 Troubleshooting

### Issue: Stripe webhook not receiving events

**Solution:**
1. Check webhook URL is publicly accessible
2. Verify webhook secret matches Appwrite function env variable
3. Check Stripe dashboard → Webhooks → Event logs for errors
4. Ensure Appwrite function is deployed and active

### Issue: File upload fails

**Solution:**
1. Check file size (max 100MB)
2. Verify file type is allowed
3. Check Appwrite storage bucket permissions
4. Verify storage bucket exists and is configured correctly

### Issue: Payment succeeds but order not created

**Solution:**
1. Check Appwrite function logs for `onQuoteAccepted`
2. Verify database permissions allow order creation
3. Check webhook function logs for errors
4. Ensure transaction is logged in `transactions` collection

### Issue: Designer not receiving payout

**Solution:**
1. Check order status is `completed`
2. Verify escrow status is `released`
3. Check transaction log for payout entry
4. For manual payouts, admin must process via bank transfer
5. For Stripe Connect, check designer's connected account status

### Issue: WhatsApp link not working

**Solution:**
1. Ensure designer has phone number in profile
2. Verify phone number format: `+91XXXXXXXXXX` (India)
3. Check URL encoding of message
4. Test link in different browsers

---

## 📞 Support

For issues or questions:
- **Email:** support@aivogue.com
- **Documentation:** [Link to docs]
- **Appwrite Docs:** https://appwrite.io/docs
- **Stripe Docs:** https://stripe.com/docs

---

## 📄 License

Proprietary - AI VOGUE © 2024

---

## 🎉 Next Steps

After successful setup:

1. **Seed sample data** using `seed-data.js`
2. **Create test accounts** (customer, designer, admin)
3. **Run end-to-end tests**
4. **Customize microcopy** and branding
5. **Add legal terms** and privacy policy
6. **Launch beta** with limited users
7. **Gather feedback** and iterate
8. **Scale to production**

---

**Built with ❤️ for AI VOGUE**
