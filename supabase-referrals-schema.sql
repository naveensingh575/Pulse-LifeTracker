-- ==============================================================================
-- PULSE LIFE TRACKER - Tiered Viral Referral Engine Schema
-- Tracks user-to-user referral attributions, milestone counts & rewards
-- ==============================================================================

-- 1. Create referrals table if not exists
CREATE TABLE IF NOT EXISTS public.referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_code VARCHAR(50) NOT NULL,
    referrer_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    referred_email VARCHAR(255),
    status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'fraud'
    reward_granted BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Indexes for fast lookup by referral code and user
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_code ON public.referrals(referrer_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_user ON public.referrals(referrer_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_user ON public.referrals(referred_user_id);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Referrers can view records of their own referrals
DROP POLICY IF EXISTS "Referrers can view own referrals" ON public.referrals;
CREATE POLICY "Referrers can view own referrals"
    ON public.referrals
    FOR SELECT
    TO authenticated
    USING (
        auth.uid() = referrer_user_id OR 
        referrer_code = (SELECT raw_user_meta_data->>'referral_code' FROM auth.users WHERE id = auth.uid())
    );

-- Authenticated new users can insert referral row upon sign-up
DROP POLICY IF EXISTS "New users can insert referral" ON public.referrals;
CREATE POLICY "New users can insert referral"
    ON public.referrals
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = referred_user_id);
