const sdk = require('node-appwrite');
const Stripe = require('stripe');

/**
 * Appwrite Function: webhookStripe
 * 
 * Handles Stripe webhook events for payment processing.
 * Updates order and transaction status based on payment events.
 * 
 * Events handled:
 * - payment_intent.succeeded
 * - payment_intent.payment_failed
 * - charge.refunded
 */

module.exports = async ({ req, res, log, error }) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

        // Verify webhook signature
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
        } catch (err) {
            error(`Webhook signature verification failed: ${err.message}`);
            return res.json({
                success: false,
                error: 'Invalid signature'
            }, 400);
        }

        log(`Received Stripe event: ${event.type}`);

        // Initialize Appwrite SDK
        const client = new sdk.Client()
            .setEndpoint(process.env.APPWRITE_ENDPOINT)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const databases = new sdk.Databases(client);

        // Handle different event types
        switch (event.type) {
            case 'payment_intent.succeeded':
                await handlePaymentSuccess(event.data.object, databases, log);
                break;

            case 'payment_intent.payment_failed':
                await handlePaymentFailed(event.data.object, databases, log, error);
                break;

            case 'charge.refunded':
                await handleRefund(event.data.object, databases, log);
                break;

            default:
                log(`Unhandled event type: ${event.type}`);
        }

        return res.json({ received: true });

    } catch (err) {
        error(`Error in webhookStripe: ${err.message}`);
        error(err.stack);

        return res.json({
            success: false,
            error: err.message
        }, 500);
    }
};

/**
 * Handle successful payment
 */
async function handlePaymentSuccess(paymentIntent, databases, log) {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
        log('No order_id in payment intent metadata');
        return;
    }

    log(`Payment succeeded for order: ${orderId}`);

    try {
        // Update order status to in_progress (payment received, escrow held)
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'orders',
            orderId,
            {
                status: 'in_progress',
                escrow_status: 'held'
            }
        );

        // Update transaction status
        const transactions = await databases.listDocuments(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'transactions',
            [
                sdk.Query.equal('order_id', orderId)
            ]
        );

        if (transactions.documents.length > 0) {
            await databases.updateDocument(
                process.env.DATABASE_ID || 'custom_fashion_db',
                'transactions',
                transactions.documents[0].$id,
                {
                    stripe_payment_id: paymentIntent.id,
                    status: 'succeeded'
                }
            );
        }

        log(`Order ${orderId} updated to in_progress with escrow held`);

        // TODO: Send email notification to designer
        // await sendNotification(designerId, 'New Order', 'You have a new order!');

    } catch (err) {
        log(`Error updating order ${orderId}: ${err.message}`);
        throw err;
    }
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent, databases, log, error) {
    const orderId = paymentIntent.metadata.order_id;

    if (!orderId) {
        log('No order_id in payment intent metadata');
        return;
    }

    log(`Payment failed for order: ${orderId}`);

    try {
        // Update order status to cancelled
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'orders',
            orderId,
            {
                status: 'cancelled'
            }
        );

        // Update transaction status
        const transactions = await databases.listDocuments(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'transactions',
            [
                sdk.Query.equal('order_id', orderId)
            ]
        );

        if (transactions.documents.length > 0) {
            await databases.updateDocument(
                process.env.DATABASE_ID || 'custom_fashion_db',
                'transactions',
                transactions.documents[0].$id,
                {
                    stripe_payment_id: paymentIntent.id,
                    status: 'failed'
                }
            );
        }

        // Revert quote status back to sent
        const order = await databases.getDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'orders',
            orderId
        );

        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'quotes',
            order.quote_id,
            {
                status: 'sent'
            }
        );

        log(`Order ${orderId} cancelled due to payment failure`);

        // TODO: Send email notification to customer
        // await sendNotification(customerId, 'Payment Failed', 'Your payment failed. Please try again.');

    } catch (err) {
        error(`Error handling failed payment for order ${orderId}: ${err.message}`);
        throw err;
    }
}

/**
 * Handle refund
 */
async function handleRefund(charge, databases, log) {
    const paymentIntentId = charge.payment_intent;

    log(`Refund processed for payment: ${paymentIntentId}`);

    try {
        // Find transaction by stripe_payment_id
        const transactions = await databases.listDocuments(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'transactions',
            [
                sdk.Query.equal('stripe_payment_id', paymentIntentId)
            ]
        );

        if (transactions.documents.length === 0) {
            log(`No transaction found for payment: ${paymentIntentId}`);
            return;
        }

        const transaction = transactions.documents[0];
        const orderId = transaction.order_id;

        // Update transaction status
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'transactions',
            transaction.$id,
            {
                status: 'refunded'
            }
        );

        // Update order escrow status
        await databases.updateDocument(
            process.env.DATABASE_ID || 'custom_fashion_db',
            'orders',
            orderId,
            {
                escrow_status: 'refunded',
                status: 'cancelled'
            }
        );

        log(`Order ${orderId} refunded successfully`);

        // TODO: Send email notifications
        // await sendNotification(customerId, 'Refund Processed', 'Your refund has been processed.');

    } catch (err) {
        log(`Error handling refund: ${err.message}`);
        throw err;
    }
}
