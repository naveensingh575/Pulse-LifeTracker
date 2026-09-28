import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client using Service Role Key (bypasses RLS for secure server updates)
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = (supabaseUrl && supabaseServiceKey) 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

/**
 * Verify Razorpay HMAC-SHA256 Webhook Signature
 */
function verifyWebhookSignature(rawBody, signature, secret) {
  if (!secret) return true; // If secret is not set, allow processing or log warning
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex');

  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');
  const signatureBuffer = Buffer.from(signature, 'utf8');

  if (expectedBuffer.length !== signatureBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(expectedBuffer, signatureBuffer);
}

/**
 * Calculate Period Expiration based on planId
 */
function calculatePeriodEnd(planId, fromDate = new Date()) {
  const date = new Date(fromDate);
  if (planId === 'monthly') {
    date.setMonth(date.getMonth() + 1);
    return date.toISOString();
  } else if (planId === 'yearly') {
    date.setFullYear(date.getFullYear() + 1);
    return date.toISOString();
  } else if (planId === 'lifetime' || planId === 'founder') {
    return null; // Lifetime access
  }
  date.setMonth(date.getMonth() + 1);
  return date.toISOString();
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed. Use POST.' });
  }

  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];
  const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

  // 1. Signature Verification
  if (webhookSecret && signature) {
    const isValid = verifyWebhookSignature(rawBody, signature, webhookSecret);
    if (!isValid) {
      console.error('[Razorpay Webhook] Invalid signature received.');
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }
  }

  const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const eventType = event.event;
  const payload = event.payload || {};

  console.log(`[Razorpay Webhook] Processing event: ${eventType}`);

  try {
    // 2. Handle Payment Captured & Order Paid
    if (eventType === 'payment.captured' || eventType === 'order.paid') {
      const payment = payload.payment?.entity || {};
      const notes = payment.notes || {};
      const userId = notes.userId || notes.user_id;
      const planId = notes.planId || notes.plan_id || 'monthly';
      const amountPaise = payment.amount || 0;
      const currency = payment.currency || 'INR';
      const paymentId = payment.id;
      const orderId = payment.order_id;

      const tier = (planId === 'lifetime' || planId === 'founder') ? 'founder' : 'pro';
      const periodStart = new Date().toISOString();
      const periodEnd = calculatePeriodEnd(planId);

      if (userId && supabaseAdmin) {
        // Upsert subscription record
        await supabaseAdmin
          .from('user_subscriptions')
          .upsert({
            user_id: userId,
            plan_id: planId,
            tier: tier,
            status: 'active',
            amount_paid_paise: amountPaise,
            currency: currency,
            razorpay_payment_id: paymentId,
            razorpay_order_id: orderId,
            current_period_start: periodStart,
            current_period_end: periodEnd,
            cancel_at_period_end: false,
            metadata: {
              email: payment.email,
              contact: payment.contact,
              method: payment.method,
              notes: notes
            },
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id' });

        // Update auth user metadata for fast client session access
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            is_premium: true,
            plan: planId,
            tier: tier,
            subscription_status: 'active',
            subscription_end: periodEnd,
            last_payment_id: paymentId
          }
        });

        console.log(`[Razorpay Webhook] User ${userId} successfully upgraded to ${tier} (${planId}).`);
      }
    }

    // 3. Handle Subscription Charged (Recurring renewals)
    else if (eventType === 'subscription.charged') {
      const subscription = payload.subscription?.entity || {};
      const payment = payload.payment?.entity || {};
      const notes = subscription.notes || payment.notes || {};
      const userId = notes.userId || notes.user_id;
      const planId = notes.planId || notes.plan_id || 'monthly';
      const periodEnd = new Date(subscription.current_end * 1000).toISOString();

      if (userId && supabaseAdmin) {
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'active',
            razorpay_payment_id: payment.id,
            current_period_end: periodEnd,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        console.log(`[Razorpay Webhook] Subscription renewed for user ${userId} until ${periodEnd}.`);
      }
    }

    // 4. Handle Subscription Cancelled or Halted
    else if (eventType === 'subscription.cancelled' || eventType === 'subscription.halted') {
      const subscription = payload.subscription?.entity || {};
      const notes = subscription.notes || {};
      const userId = notes.userId || notes.user_id;

      if (userId && supabaseAdmin) {
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: eventType === 'subscription.cancelled' ? 'cancelled' : 'past_due',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        console.log(`[Razorpay Webhook] Subscription for user ${userId} marked as ${eventType}.`);
      }
    }

    // 5. Handle Refund Processed
    else if (eventType === 'refund.processed') {
      const payment = payload.payment?.entity || {};
      const notes = payment.notes || {};
      const userId = notes.userId || notes.user_id;

      if (userId && supabaseAdmin) {
        await supabaseAdmin
          .from('user_subscriptions')
          .update({
            status: 'refunded',
            tier: 'free',
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        await supabaseAdmin.auth.admin.updateUserById(userId, {
          user_metadata: {
            is_premium: false,
            plan: 'free',
            tier: 'free',
            subscription_status: 'refunded'
          }
        });

        console.log(`[Razorpay Webhook] Refund processed. User ${userId} reverted to free tier.`);
      }
    }

    return res.status(200).json({ status: 'ok', received: true, event: eventType });
  } catch (error) {
    console.error('[Razorpay Webhook] Error processing webhook event:', error);
    return res.status(500).json({ error: 'Internal server error processing webhook.' });
  }
}
