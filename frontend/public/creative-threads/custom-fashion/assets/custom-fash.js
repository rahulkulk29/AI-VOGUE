/**
 * Custom Fashion Designer Marketplace - Core Library
 * Handles all Appwrite SDK interactions, file uploads, and Stripe integration
 * 
 * @version 1.0.0
 * @author AI VOGUE
 */

// Appwrite SDK Configuration
const appwriteConfig = {
    endpoint: 'https://cloud.appwrite.io/v1', // Update with your Appwrite endpoint
    project: 'YOUR_PROJECT_ID', // Update with your project ID
    databaseId: 'custom_fashion_db',

    // Collection IDs
    collections: {
        users: 'users',
        designerProfiles: 'designer_profiles',
        customRequests: 'custom_requests',
        quotes: 'quotes',
        orders: 'orders',
        orderAssets: 'order_assets',
        messages: 'messages',
        reviews: 'reviews',
        transactions: 'transactions'
    },

    // Storage Bucket IDs
    buckets: {
        requestImages: 'request_images',
        deliverables: 'deliverables',
        thumbnails: 'thumbnails'
    },

    // Function IDs
    functions: {
        onQuoteAccepted: 'onQuoteAccepted',
        webhookStripe: 'webhookStripe',
        onDeliverableUploaded: 'onDeliverableUploaded',
        onOrderCompleted: 'onOrderCompleted',
        refundOrDispute: 'refundOrDispute',
        validateUpload: 'validateUpload',
        sendNotification: 'sendNotification'
    }
};

// Stripe Configuration
const stripeConfig = {
    publishableKey: 'pk_test_YOUR_STRIPE_KEY', // Update with your Stripe publishable key
    currency: 'inr',
    country: 'IN'
};

// Platform Configuration
const platformConfig = {
    feePercent: 5.5,
    defaultRevisions: 2,
    maxFileSizeMB: 100,
    allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf', 'psd', 'ai', 'zip'],
    allowedImageTypes: ['jpg', 'jpeg', 'png']
};

// Initialize Appwrite SDK
const { Client, Account, Databases, Storage, Functions, Query, ID } = Appwrite;

const client = new Client()
    .setEndpoint(appwriteConfig.endpoint)
    .setProject(appwriteConfig.project);

const account = new Account(client);
const databases = new Databases(client);
const storage = new Storage(client);
const functions = new Functions(client);

/**
 * Custom Fashion Marketplace API
 */
class CustomFashionAPI {
    constructor() {
        this.currentUser = null;
        this.stripe = null;
        this.uploadProgress = {};
    }

    // ==================== Authentication ====================

    /**
     * Get current logged-in user
     */
    async getCurrentUser() {
        try {
            if (this.currentUser) return this.currentUser;

            const user = await account.get();

            // Fetch user profile from database
            const userDoc = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                user.$id
            );

            this.currentUser = { ...user, ...userDoc };
            return this.currentUser;
        } catch (error) {
            console.error('Get current user error:', error);
            return null;
        }
    }

    /**
     * Create new user account
     */
    async createAccount(email, password, name, role = 'customer') {
        try {
            const user = await account.create(ID.unique(), email, password, name);

            // Create user profile in database
            await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                user.$id,
                {
                    name,
                    email,
                    role,
                    verified_designer: false,
                    created_at: new Date().toISOString()
                }
            );

            // Auto-login
            await account.createEmailSession(email, password);

            return await this.getCurrentUser();
        } catch (error) {
            console.error('Create account error:', error);
            throw error;
        }
    }

    /**
     * Login user
     */
    async login(email, password) {
        try {
            await account.createEmailSession(email, password);
            return await this.getCurrentUser();
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await account.deleteSession('current');
            this.currentUser = null;
            window.location.href = '/login.html';
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     */
    async updateProfile(userId, data) {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.users,
                userId,
                data
            );
        } catch (error) {
            console.error('Update profile error:', error);
            throw error;
        }
    }

    // ==================== Designer Management ====================

    /**
     * Register as designer
     */
    async registerAsDesigner(designerData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            // Create designer profile
            const profile = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.designerProfiles,
                ID.unique(),
                {
                    user_id: user.$id,
                    business_name: designerData.businessName || '',
                    skills_tags: designerData.skills || [],
                    avg_delivery_days: designerData.avgDeliveryDays || 7,
                    approved_at: null, // Pending admin approval
                    bank_details_encrypted: designerData.bankDetails || ''
                }
            );

            // Update user role to designer (pending verification)
            await this.updateProfile(user.$id, { role: 'designer' });

            return profile;
        } catch (error) {
            console.error('Register designer error:', error);
            throw error;
        }
    }

    /**
     * Get designer profile
     */
    async getDesignerProfile(userId) {
        try {
            const profiles = await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.designerProfiles,
                [Query.equal('user_id', userId)]
            );

            return profiles.documents[0] || null;
        } catch (error) {
            console.error('Get designer profile error:', error);
            return null;
        }
    }

    /**
     * Approve designer (admin only)
     */
    async approveDesigner(profileId) {
        try {
            return await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.designerProfiles,
                profileId,
                {
                    approved_at: new Date().toISOString()
                }
            );
        } catch (error) {
            console.error('Approve designer error:', error);
            throw error;
        }
    }

    // ==================== Custom Requests ====================

    /**
     * Create custom request
     */
    async createRequest(requestData) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const request = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.customRequests,
                ID.unique(),
                {
                    customer_id: user.$id,
                    title: requestData.title,
                    description: requestData.description,
                    occasion: requestData.occasion || '',
                    budget_min: parseInt(requestData.budgetMin),
                    budget_max: parseInt(requestData.budgetMax),
                    size_json: JSON.stringify(requestData.sizeInfo || {}),
                    deadline_date: requestData.deadline ? new Date(requestData.deadline).toISOString() : null,
                    ref_images: requestData.refImages || [],
                    visibility: requestData.visibility || 'public',
                    status: 'open',
                    created_at: new Date().toISOString()
                }
            );

            return request;
        } catch (error) {
            console.error('Create request error:', error);
            throw error;
        }
    }

    /**
     * Get all open requests
     */
    async getOpenRequests(limit = 50, offset = 0) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.customRequests,
                [
                    Query.equal('status', 'open'),
                    Query.equal('visibility', 'public'),
                    Query.orderDesc('created_at'),
                    Query.limit(limit),
                    Query.offset(offset)
                ]
            );
        } catch (error) {
            console.error('Get open requests error:', error);
            throw error;
        }
    }

    /**
     * Get request by ID
     */
    async getRequest(requestId) {
        try {
            return await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.customRequests,
                requestId
            );
        } catch (error) {
            console.error('Get request error:', error);
            throw error;
        }
    }

    /**
     * Get customer's requests
     */
    async getMyRequests() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.customRequests,
                [
                    Query.equal('customer_id', user.$id),
                    Query.orderDesc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get my requests error:', error);
            throw error;
        }
    }

    // ==================== Quotes ====================

    /**
     * Send quote to request
     */
    async sendQuote(quoteData) {
        try {
            const user = await this.getCurrentUser();
            if (!user || user.role !== 'designer') {
                throw new Error('Only designers can send quotes');
            }

            const quote = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.quotes,
                ID.unique(),
                {
                    request_id: quoteData.requestId,
                    designer_id: user.$id,
                    price: parseInt(quoteData.price),
                    delivery_days: parseInt(quoteData.deliveryDays),
                    revisions_included: parseInt(quoteData.revisions || platformConfig.defaultRevisions),
                    message: quoteData.message || '',
                    sample_file: quoteData.sampleFile || '',
                    status: 'sent',
                    created_at: new Date().toISOString()
                }
            );

            return quote;
        } catch (error) {
            console.error('Send quote error:', error);
            throw error;
        }
    }

    /**
     * Get quotes for a request
     */
    async getQuotesForRequest(requestId) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.quotes,
                [
                    Query.equal('request_id', requestId),
                    Query.orderDesc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get quotes error:', error);
            throw error;
        }
    }

    /**
     * Accept quote and create order
     */
    async acceptQuote(quoteId) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            // Get quote details
            const quote = await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.quotes,
                quoteId
            );

            // Call Appwrite Function to create Stripe payment
            const response = await functions.createExecution(
                appwriteConfig.functions.onQuoteAccepted,
                JSON.stringify({ quoteId }),
                false
            );

            // Parse response
            const result = JSON.parse(response.response);

            if (result.error) {
                throw new Error(result.error);
            }

            // Update quote status
            await databases.updateDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.quotes,
                quoteId,
                { status: 'accepted' }
            );

            return result; // Contains Stripe checkout URL
        } catch (error) {
            console.error('Accept quote error:', error);
            throw error;
        }
    }

    // ==================== Orders ====================

    /**
     * Get order by ID
     */
    async getOrder(orderId) {
        try {
            return await databases.getDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                orderId
            );
        } catch (error) {
            console.error('Get order error:', error);
            throw error;
        }
    }

    /**
     * Get customer's orders
     */
    async getMyOrders() {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.equal('customer_id', user.$id),
                    Query.orderDesc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get my orders error:', error);
            throw error;
        }
    }

    /**
     * Get designer's orders
     */
    async getDesignerOrders() {
        try {
            const user = await this.getCurrentUser();
            if (!user || user.role !== 'designer') {
                throw new Error('Only designers can access this');
            }

            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orders,
                [
                    Query.equal('designer_id', user.$id),
                    Query.orderDesc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get designer orders error:', error);
            throw error;
        }
    }

    /**
     * Complete order (customer accepts deliverable)
     */
    async completeOrder(orderId) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            // Call Appwrite Function to release escrow
            const response = await functions.createExecution(
                appwriteConfig.functions.onOrderCompleted,
                JSON.stringify({ orderId }),
                false
            );

            const result = JSON.parse(response.response);

            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Complete order error:', error);
            throw error;
        }
    }

    // ==================== File Upload ====================

    /**
     * Validate file before upload
     */
    validateFile(file) {
        const maxSizeBytes = platformConfig.maxFileSizeMB * 1024 * 1024;
        const fileExtension = file.name.split('.').pop().toLowerCase();

        if (file.size > maxSizeBytes) {
            throw new Error(`File size exceeds ${platformConfig.maxFileSizeMB}MB limit`);
        }

        if (!platformConfig.allowedFileTypes.includes(fileExtension)) {
            throw new Error(`File type .${fileExtension} not allowed. Allowed: ${platformConfig.allowedFileTypes.join(', ')}`);
        }

        return true;
    }

    /**
     * Upload reference image for request
     */
    async uploadReferenceImage(file, onProgress) {
        try {
            this.validateFile(file);

            const fileId = ID.unique();

            const uploadedFile = await storage.createFile(
                appwriteConfig.buckets.requestImages,
                fileId,
                file,
                undefined,
                (progress) => {
                    if (onProgress) {
                        const percent = (progress.chunksUploaded / progress.chunksTotal) * 100;
                        onProgress(percent);
                    }
                }
            );

            return uploadedFile;
        } catch (error) {
            console.error('Upload reference image error:', error);
            throw error;
        }
    }

    /**
     * Upload deliverable for order
     */
    async uploadDeliverable(orderId, file, notes, onProgress) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            this.validateFile(file);

            const fileId = ID.unique();

            // Upload file to storage
            const uploadedFile = await storage.createFile(
                appwriteConfig.buckets.deliverables,
                fileId,
                file,
                undefined,
                (progress) => {
                    if (onProgress) {
                        const percent = (progress.chunksUploaded / progress.chunksTotal) * 100;
                        onProgress(percent);
                    }
                }
            );

            // Generate thumbnail if image
            let thumbnailId = null;
            const fileExtension = file.name.split('.').pop().toLowerCase();
            if (platformConfig.allowedImageTypes.includes(fileExtension)) {
                thumbnailId = await this.generateThumbnail(file);
            }

            // Create order asset record
            const asset = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderAssets,
                ID.unique(),
                {
                    order_id: orderId,
                    uploader_id: user.$id,
                    file_id: uploadedFile.$id,
                    file_type: fileExtension,
                    thumbnail_id: thumbnailId,
                    notes: notes || '',
                    uploaded_at: new Date().toISOString()
                }
            );

            // Trigger notification function
            await functions.createExecution(
                appwriteConfig.functions.onDeliverableUploaded,
                JSON.stringify({ orderId, assetId: asset.$id }),
                false
            );

            return asset;
        } catch (error) {
            console.error('Upload deliverable error:', error);
            throw error;
        }
    }

    /**
     * Generate thumbnail for image
     */
    async generateThumbnail(file) {
        try {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();

                reader.onload = async (e) => {
                    const img = new Image();
                    img.onload = async () => {
                        // Create canvas for thumbnail
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Calculate thumbnail size (max 400x400)
                        const maxSize = 400;
                        let width = img.width;
                        let height = img.height;

                        if (width > height) {
                            if (width > maxSize) {
                                height *= maxSize / width;
                                width = maxSize;
                            }
                        } else {
                            if (height > maxSize) {
                                width *= maxSize / height;
                                height = maxSize;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to blob
                        canvas.toBlob(async (blob) => {
                            try {
                                const thumbnailFile = new File([blob], `thumb_${file.name}`, { type: 'image/jpeg' });
                                const thumbnailId = ID.unique();

                                await storage.createFile(
                                    appwriteConfig.buckets.thumbnails,
                                    thumbnailId,
                                    thumbnailFile
                                );

                                resolve(thumbnailId);
                            } catch (error) {
                                console.error('Thumbnail upload error:', error);
                                resolve(null);
                            }
                        }, 'image/jpeg', 0.8);
                    };

                    img.onerror = () => resolve(null);
                    img.src = e.target.result;
                };

                reader.onerror = () => resolve(null);
                reader.readAsDataURL(file);
            });
        } catch (error) {
            console.error('Generate thumbnail error:', error);
            return null;
        }
    }

    /**
     * Get file preview URL (signed URL for security)
     */
    getFilePreview(bucketId, fileId, width = 800, height = 800) {
        try {
            return storage.getFilePreview(bucketId, fileId, width, height);
        } catch (error) {
            console.error('Get file preview error:', error);
            return null;
        }
    }

    /**
     * Get file download URL
     */
    getFileDownload(bucketId, fileId) {
        try {
            return storage.getFileDownload(bucketId, fileId);
        } catch (error) {
            console.error('Get file download error:', error);
            return null;
        }
    }

    /**
     * Get order assets
     */
    async getOrderAssets(orderId) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.orderAssets,
                [
                    Query.equal('order_id', orderId),
                    Query.orderDesc('uploaded_at')
                ]
            );
        } catch (error) {
            console.error('Get order assets error:', error);
            throw error;
        }
    }

    // ==================== Messaging ====================

    /**
     * Send message in order thread
     */
    async sendMessage(orderId, text, attachments = []) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const message = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                ID.unique(),
                {
                    order_id: orderId,
                    sender_id: user.$id,
                    text,
                    attachments,
                    created_at: new Date().toISOString()
                }
            );

            return message;
        } catch (error) {
            console.error('Send message error:', error);
            throw error;
        }
    }

    /**
     * Get messages for order
     */
    async getMessages(orderId) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.messages,
                [
                    Query.equal('order_id', orderId),
                    Query.orderAsc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get messages error:', error);
            throw error;
        }
    }

    // ==================== WhatsApp Integration ====================

    /**
     * Generate WhatsApp contact link
     */
    generateWhatsAppLink(designerPhone, designerName, customerName, requestTitle, budgetMin, budgetMax, requestLink) {
        const message = `Hi ${designerName}, I'm ${customerName} from AI VOGUE. I posted a custom request titled '${requestTitle}'. My budget: ₹${this.formatCurrency(budgetMin)}-₹${this.formatCurrency(budgetMax)}. Please check my request: ${requestLink}. Thanks!`;

        const encodedMessage = encodeURIComponent(message);
        const formattedPhone = designerPhone.replace(/[^0-9]/g, ''); // Remove non-numeric

        return `https://api.whatsapp.com/send?phone=${formattedPhone}&text=${encodedMessage}`;
    }

    // ==================== Reviews ====================

    /**
     * Submit review for completed order
     */
    async submitReview(orderId, rating, comment) {
        try {
            const user = await this.getCurrentUser();
            if (!user) throw new Error('User not authenticated');

            const order = await this.getOrder(orderId);

            const review = await databases.createDocument(
                appwriteConfig.databaseId,
                appwriteConfig.collections.reviews,
                ID.unique(),
                {
                    order_id: orderId,
                    customer_id: user.$id,
                    designer_id: order.designer_id,
                    rating: parseInt(rating),
                    comment: comment || '',
                    created_at: new Date().toISOString()
                }
            );

            return review;
        } catch (error) {
            console.error('Submit review error:', error);
            throw error;
        }
    }

    /**
     * Get designer reviews
     */
    async getDesignerReviews(designerId) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.reviews,
                [
                    Query.equal('designer_id', designerId),
                    Query.orderDesc('created_at')
                ]
            );
        } catch (error) {
            console.error('Get designer reviews error:', error);
            throw error;
        }
    }

    // ==================== Admin Functions ====================

    /**
     * Get all pending designer approvals (admin only)
     */
    async getPendingDesigners() {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.designerProfiles,
                [
                    Query.isNull('approved_at'),
                    Query.orderDesc('$createdAt')
                ]
            );
        } catch (error) {
            console.error('Get pending designers error:', error);
            throw error;
        }
    }

    /**
     * Trigger refund (admin only)
     */
    async triggerRefund(orderId, reason) {
        try {
            const response = await functions.createExecution(
                appwriteConfig.functions.refundOrDispute,
                JSON.stringify({ orderId, reason, action: 'refund' }),
                false
            );

            const result = JSON.parse(response.response);

            if (result.error) {
                throw new Error(result.error);
            }

            return result;
        } catch (error) {
            console.error('Trigger refund error:', error);
            throw error;
        }
    }

    /**
     * Get all transactions (admin only)
     */
    async getAllTransactions(limit = 100) {
        try {
            return await databases.listDocuments(
                appwriteConfig.databaseId,
                appwriteConfig.collections.transactions,
                [
                    Query.orderDesc('created_at'),
                    Query.limit(limit)
                ]
            );
        } catch (error) {
            console.error('Get transactions error:', error);
            throw error;
        }
    }

    // ==================== Utility Functions ====================

    /**
     * Format currency (INR)
     */
    formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount).replace('₹', '').trim();
    }

    /**
     * Calculate platform fee
     */
    calculateFee(amount, feePercent = platformConfig.feePercent) {
        const fee = Math.round((amount * feePercent) / 100);
        const net = amount - fee;
        return { fee, net };
    }

    /**
     * Format date
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date);
    }

    /**
     * Get order status label
     */
    getOrderStatusLabel(status) {
        const labels = {
            'in_progress': 'In Progress',
            'delivered': 'Delivered',
            'completed': 'Completed',
            'disputed': 'Disputed',
            'cancelled': 'Cancelled'
        };
        return labels[status] || status;
    }

    /**
     * Get escrow status label
     */
    getEscrowStatusLabel(status) {
        const labels = {
            'held': 'Held in Escrow',
            'released': 'Released to Designer',
            'refunded': 'Refunded to Customer'
        };
        return labels[status] || status;
    }
}

// Initialize global API instance
const customFashionAPI = new CustomFashionAPI();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { CustomFashionAPI, customFashionAPI, appwriteConfig, stripeConfig, platformConfig };
}
