const sdk = require('node-appwrite');
const Stripe = require('stripe');

/**
 * Appwrite Function: onQuoteAccepted
 * 
 * Triggered when a customer accepts a designer's quote.
 * Creates an Order and initiates Stripe Checkout session for payment.
 * 
 * Input: { quoteId: string }
 * Output: { success: boolean, checkoutUrl: string, orderId: string, error?: string }
 */

module.exports = async ({ req, res, log, error }) => {
    try {
        // Parse request body
        const payload = JSON.parse(req.body || '{}');
        const { quoteId } = payload;

        if (!quoteId) {
            return res.json({
                success: false,
                error: 'Quote ID is required'
            }, 400);
        }

        log(`Processing quote acceptance: ${quoteId}`);

        // Initialize Appwrite SDK
        const client = new sdk.Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new sdk.Databases(client);
        const users = new sdk.Users(client);

        // Fetch quote details
        const quote = await databases.getDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'quotes',
            quoteId
        );

        if (!quote) {
            return res.json({
                success: false,
                error: 'Quote not found'
            }, 404);
        }

        if (quote.status !== 'sent') {
            return res.json({
                success: false,
                error: `Quote already ${quote.status}`
            }, 400);
        }

        // Fetch request details
        const request = await databases.getDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'custom_requests',
            quote.request_id
        );

        // Verify customer owns the request
        if (request.customer_id !== req.headers['x-appwrite-user-id']) {
            return res.json({
                success: false,
                error: 'Unauthorized: You do not own this request'
            }, 403);
        }

        // Fetch customer and designer details
        const customer = await users.get(request.customer_id);
        const designer = await users.get(quote.designer_id);

        // Calculate platform fee
        const platformFeePercent = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5.5');
        const amount = quote.price; // Amount in INR (smallest currency unit, paise)
        const feeAmount = Math.round((amount * platformFeePercent) / 100);
        const netAmount = amount - feeAmount;

        log(`Amount: ₹${amount / 100}, Fee: ₹${feeAmount / 100}, Net: ₹${netAmount / 100}`);

        // Create Order document
        const orderId = sdk.ID.unique();
        const order = await databases.createDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'orders',
            orderId,
            {
                quote_id: quoteId,
                customer_id: request.customer_id,
                designer_id: quote.designer_id,
                amount: amount,
                escrow_status: 'held',
                revision_count_remaining: quote.revisions_included || 2,
                status: 'in_progress', // Will be updated after payment success
                created_at: new Date().toISOString(),
                completed_at: null
            }
        );

        log(`Order created: ${orderId}`);

        // Initialize Stripe
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

        // Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card', 'upi'], // India-specific payment methods
            line_items: [
                {
                    price_data: {
                        currency: 'inr',
                        product_data: {
                            name: `Custom Fashion Design: ${request.title}`,
                            description: `Designer: ${designer.name} | Delivery: ${quote.delivery_days} days | Revisions: ${quote.revisions_included}`,
                            images: request.ref_images && request.ref_images.length > 0
                                ? [request.ref_images[0]]
                                : []
                        },
                        unit_amount: amount // Amount in paise (smallest unit)
                    },
                    quantity: 1
                }
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL || 'http://localhost'}/creative-threads/custom-fashion/order.html?id=${orderId}&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.FRONTEND_URL || 'http://localhost'}/creative-threads/custom-fashion/request-detail.html?id=${request.$id}`,
            customer_email: customer.email,
            metadata: {
                order_id: orderId,
                quote_id: quoteId,
                customer_id: request.customer_id,
                designer_id: quote.designer_id,
                platform_fee_percent: platformFeePercent.toString(),
                platform_fee_amount: feeAmount.toString(),
                net_amount: netAmount.toString()
            },
            payment_intent_data: {
                metadata: {
                    order_id: orderId,
                    quote_id: quoteId
                },
                description: `Custom Fashion Order #${orderId.substring(0, 8)}`
            }
        });

        log(`Stripe Checkout Session created: ${session.id}`);

        // Update quote status to accepted
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'quotes',
            quoteId,
            {
                status: 'accepted'
            }
        );

        // Update request status to assigned
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'custom_requests',
            quote.request_id,
            {
                status: 'assigned'
            }
        );

        // Create initial transaction record (pending)
        await databases.createDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'transactions',
            sdk.ID.unique(),
            {
                order_id: orderId,
                stripe_payment_id: session.payment_intent || session.id,
                amount: amount,
                fee_percent: platformFeePercent,
                fee_amount: feeAmount,
                net_amount: netAmount,
                status: 'pending',
                created_at: new Date().toISOString()
            }
        );

        log('Transaction record created');

        // Return success with checkout URL
        return res.json({
            success: true,
            checkoutUrl: session.url,
            orderId: orderId,
            sessionId: session.id,
            amount: amount,
            platformFee: feeAmount,
            netToDesigner: netAmount
        });

    } catch (err) {
        error(`Error in onQuoteAccepted: ${err.message}`);
        error(err.stack);

        return res.json({
            success: false,
            error: err.message || 'Internal server error'
        }, 500);
    }
};
