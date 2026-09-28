-- ==============================================================================
-- PULSE LIFE TRACKER - Phase 7 Subscriptions & Webhooks Schema
-- Authoritative Subscription Records, Expiry Tracking & Transaction History
-- ==============================================================================

-- 1. Create user_subscriptions table if not exists
CREATE TABLE IF NOT EXISTS public.user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    plan_id VARCHAR(50) NOT NULL, -- 'monthly', 'yearly', 'lifetime', 'founder'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'cancelled', 'expired', 'past_due', 'refunded'
    tier VARCHAR(50) NOT NULL DEFAULT 'pro', -- 'free', 'pro', 'founder'
    amount_paid_paise BIGINT NOT NULL DEFAULT 0,
    currency VARCHAR(10) NOT NULL DEFAULT 'INR',
    razorpay_payment_id VARCHAR(255),
    razorpay_order_id VARCHAR(255),
    razorpay_subscription_id VARCHAR(255),
    current_period_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    current_period_end TIMESTAMPTZ, -- NULL for Lifetime / Founder plans
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create index on user_id and status for fast lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON public.user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON public.user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_payment_id ON public.user_subscriptions(razorpay_payment_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies:
-- Users can read their own subscription records
CREATE POLICY "Users can view own subscription" 
    ON public.user_subscriptions 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Users cannot modify subscription records directly (only Service Role / Webhook backend can write)
-- Service role has bypass RLS by default in Supabase.

-- 5. Auto-update timestamp trigger
CREATE OR REPLACE FUNCTION update_user_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_user_subscriptions_updated_at ON public.user_subscriptions;
CREATE TRIGGER trigger_user_subscriptions_updated_at
    BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_user_subscriptions_updated_at();
