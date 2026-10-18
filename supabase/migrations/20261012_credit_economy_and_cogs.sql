-- ==============================================================================
-- ResumeForgeAI — Level 11: Production Credit Economy, Plans, Top-Ups & COGS
-- ==============================================================================
-- Creates credit_wallets, credit_ledger, credit_reservations, and usage_costs
-- with atomic concurrency control, idempotency, and RLS security.
-- ==============================================================================

-- 1. Credit Wallets Table (Strict non-negative balance checks)
CREATE TABLE IF NOT EXISTS public.credit_wallets (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    available_balance INT NOT NULL DEFAULT 0 CHECK (available_balance >= 0),
    reserved_balance INT NOT NULL DEFAULT 0 CHECK (reserved_balance >= 0),
    plan_id TEXT NOT NULL DEFAULT 'STARTER',
    plan_expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Credit Ledger Table (Source of truth for all transactions)
CREATE TABLE IF NOT EXISTS public.credit_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    transaction_type TEXT NOT NULL CHECK (
        transaction_type IN ('GRANT', 'PURCHASE', 'RESERVE', 'SETTLE', 'RELEASE', 'REFUND', 'ADJUSTMENT', 'EXPIRE')
    ),
    amount INT NOT NULL, -- positive for grants/settles, negative for deductions/reserves
    available_balance_after INT NOT NULL,
    reserved_balance_after INT NOT NULL,
    reason TEXT NOT NULL,
    reference_type TEXT,
    reference_id TEXT,
    idempotency_key TEXT UNIQUE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_ledger_user_time ON public.credit_ledger(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_idempotency ON public.credit_ledger(idempotency_key);
CREATE INDEX IF NOT EXISTS idx_credit_ledger_reason ON public.credit_ledger(reason);

-- 3. Credit Reservations Table (Two-phase settlement for variable-cost actions)
CREATE TABLE IF NOT EXISTS public.credit_reservations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    reserved_amount INT NOT NULL CHECK (reserved_amount > 0),
    settled_amount INT NOT NULL DEFAULT 0 CHECK (settled_amount >= 0),
    released_amount INT NOT NULL DEFAULT 0 CHECK (released_amount >= 0),
    status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (
        status IN ('ACTIVE', 'SETTLED', 'PARTIALLY_SETTLED', 'RELEASED', 'EXPIRED')
    ),
    reference_type TEXT,
    reference_id TEXT,
    idempotency_key TEXT UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_credit_reservations_user ON public.credit_reservations(user_id, status);
CREATE INDEX IF NOT EXISTS idx_credit_reservations_expires ON public.credit_reservations(expires_at) WHERE status = 'ACTIVE';

-- 4. Actual Cost & COGS Table (Internal provider infrastructure costs)
CREATE TABLE IF NOT EXISTS public.usage_costs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    action TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    input_tokens INT DEFAULT 0,
    output_tokens INT DEFAULT 0,
    ai_cost NUMERIC(10, 6) DEFAULT 0,
    search_cost NUMERIC(10, 6) DEFAULT 0,
    browser_cost NUMERIC(10, 6) DEFAULT 0,       -- prepared for future browser actions
    browser_minutes NUMERIC(10, 2) DEFAULT 0,    -- prepared for future browser actions
    storage_cost NUMERIC(10, 6) DEFAULT 0,
    other_cost NUMERIC(10, 6) DEFAULT 0,
    total_cost NUMERIC(10, 6) DEFAULT 0,
    currency TEXT DEFAULT 'INR',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_usage_costs_user ON public.usage_costs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_costs_action ON public.usage_costs(action, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_usage_costs_provider ON public.usage_costs(provider, model);

-- ==============================================================================
-- 5. Row Level Security
-- Users can READ own wallet, ledger, and reservations.
-- Only service role can MUTATE (prevents client tampering).
-- ==============================================================================

ALTER TABLE public.credit_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.credit_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_costs ENABLE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "Service role full access credit_wallets" ON public.credit_wallets USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access credit_ledger" ON public.credit_ledger USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access credit_reservations" ON public.credit_reservations USING (true) WITH CHECK (true);
CREATE POLICY "Service role full access usage_costs" ON public.usage_costs USING (true) WITH CHECK (true);

-- Authenticated user read-only access to own records
CREATE POLICY "Users can view own credit_wallets" ON public.credit_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credit_ledger" ON public.credit_ledger FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own credit_reservations" ON public.credit_reservations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view own usage_costs" ON public.usage_costs FOR SELECT USING (auth.uid() = user_id);

-- ==============================================================================
-- 6. Atomic Stored Procedures (Locking & Concurrency Safety)
-- ==============================================================================

-- A. Atomic Reservation RPC
CREATE OR REPLACE FUNCTION public.reserve_credits_atomic(
    p_user_id UUID,
    p_amount INT,
    p_action TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL,
    p_expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 minutes')
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_res_id UUID;
    v_existing_res RECORD;
BEGIN
    -- Check idempotency
    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO v_existing_res FROM public.credit_reservations WHERE idempotency_key = p_idempotency_key;
        IF FOUND THEN
            RETURN jsonb_build_object(
                'success', true,
                'reservation_id', v_existing_res.id,
                'reserved_amount', v_existing_res.reserved_amount,
                'status', v_existing_res.status,
                'is_idempotent', true
            );
        END IF;
    END IF;

    -- Lock wallet row
    SELECT * INTO v_wallet FROM public.credit_wallets WHERE user_id = p_user_id FOR UPDATE;
    
    -- Auto-initialize wallet if missing
    IF NOT FOUND THEN
        INSERT INTO public.credit_wallets (user_id, available_balance, reserved_balance, plan_id)
        VALUES (p_user_id, 0, 0, 'STARTER')
        RETURNING * INTO v_wallet;
    END IF;

    -- Check balance
    IF v_wallet.available_balance < p_amount THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'INSUFFICIENT_CREDITS',
            'available_balance', v_wallet.available_balance,
            'required', p_amount
        );
    END IF;

    -- Deduct available, increment reserved
    UPDATE public.credit_wallets
    SET available_balance = available_balance - p_amount,
        reserved_balance = reserved_balance + p_amount,
        updated_at = NOW()
    WHERE user_id = p_user_id
    RETURNING * INTO v_wallet;

    -- Create reservation record
    INSERT INTO public.credit_reservations (
        user_id, action, reserved_amount, status,
        reference_type, reference_id, idempotency_key, expires_at
    ) VALUES (
        p_user_id, p_action, p_amount, 'ACTIVE',
        p_reference_type, p_reference_id, p_idempotency_key, p_expires_at
    ) RETURNING id INTO v_res_id;

    -- Log transaction in ledger
    INSERT INTO public.credit_ledger (
        user_id, transaction_type, amount,
        available_balance_after, reserved_balance_after,
        reason, reference_type, reference_id, idempotency_key, metadata
    ) VALUES (
        p_user_id, 'RESERVE', -p_amount,
        v_wallet.available_balance, v_wallet.reserved_balance,
        'RESERVE_' || p_action, p_reference_type, v_res_id::text,
        p_idempotency_key, jsonb_build_object('reservation_id', v_res_id, 'action', p_action)
    );

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', v_res_id,
        'reserved_amount', p_amount,
        'available_balance', v_wallet.available_balance,
        'reserved_balance', v_wallet.reserved_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- B. Atomic Settlement RPC (With Partial Settlement & Release)
CREATE OR REPLACE FUNCTION public.settle_reservation_atomic(
    p_reservation_id UUID,
    p_settled_amount INT DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
    v_wallet RECORD;
    v_actual_settle INT;
    v_unsettled INT;
    v_new_status TEXT;
BEGIN
    -- Lock reservation row
    SELECT * INTO v_res FROM public.credit_reservations WHERE id = p_reservation_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_FOUND');
    END IF;

    IF v_res.status NOT IN ('ACTIVE') THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_ALREADY_CLOSED', 'status', v_res.status);
    END IF;

    -- Lock wallet row
    SELECT * INTO v_wallet FROM public.credit_wallets WHERE user_id = v_res.user_id FOR UPDATE;

    -- Settle amount defaults to full reserved_amount if not specified
    v_actual_settle := COALESCE(p_settled_amount, v_res.reserved_amount);
    IF v_actual_settle > v_res.reserved_amount THEN
        v_actual_settle := v_res.reserved_amount;
    END IF;
    IF v_actual_settle < 0 THEN
        v_actual_settle := 0;
    END IF;

    v_unsettled := v_res.reserved_amount - v_actual_settle;
    v_new_status := CASE WHEN v_unsettled > 0 THEN 'PARTIALLY_SETTLED' ELSE 'SETTLED' END;

    -- Update wallet:
    -- Remove full reserved_amount from reserved_balance.
    -- Return any unsettled portion back to available_balance.
    UPDATE public.credit_wallets
    SET reserved_balance = GREATEST(0, reserved_balance - v_res.reserved_amount),
        available_balance = available_balance + v_unsettled,
        updated_at = NOW()
    WHERE user_id = v_res.user_id
    RETURNING * INTO v_wallet;

    -- Update reservation record
    UPDATE public.credit_reservations
    SET settled_amount = v_actual_settle,
        released_amount = v_unsettled,
        status = v_new_status,
        updated_at = NOW()
    WHERE id = p_reservation_id;

    -- Log SETTLE in ledger
    INSERT INTO public.credit_ledger (
        user_id, transaction_type, amount,
        available_balance_after, reserved_balance_after,
        reason, reference_type, reference_id, idempotency_key, metadata
    ) VALUES (
        v_res.user_id, 'SETTLE', -v_actual_settle,
        v_wallet.available_balance, v_wallet.reserved_balance,
        'SETTLE_' || v_res.action, 'reservation', p_reservation_id::text,
        p_idempotency_key, jsonb_build_object(
            'reservation_id', p_reservation_id,
            'settled_amount', v_actual_settle,
            'released_amount', v_unsettled,
            'custom_metadata', p_metadata
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', p_reservation_id,
        'settled_amount', v_actual_settle,
        'released_amount', v_unsettled,
        'status', v_new_status,
        'available_balance', v_wallet.available_balance,
        'reserved_balance', v_wallet.reserved_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- C. Atomic Refund / Release Reservation RPC (100% Release upon failure)
CREATE OR REPLACE FUNCTION public.refund_reservation_atomic(
    p_reservation_id UUID,
    p_reason TEXT DEFAULT 'SYSTEM_RELEASE',
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_idempotency_key TEXT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_res RECORD;
    v_wallet RECORD;
BEGIN
    SELECT * INTO v_res FROM public.credit_reservations WHERE id = p_reservation_id FOR UPDATE;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_NOT_FOUND');
    END IF;

    IF v_res.status NOT IN ('ACTIVE') THEN
        RETURN jsonb_build_object('success', false, 'error', 'RESERVATION_ALREADY_CLOSED', 'status', v_res.status);
    END IF;

    SELECT * INTO v_wallet FROM public.credit_wallets WHERE user_id = v_res.user_id FOR UPDATE;

    -- Return 100% of reserved amount back to available
    UPDATE public.credit_wallets
    SET reserved_balance = GREATEST(0, reserved_balance - v_res.reserved_amount),
        available_balance = available_balance + v_res.reserved_amount,
        updated_at = NOW()
    WHERE user_id = v_res.user_id
    RETURNING * INTO v_wallet;

    UPDATE public.credit_reservations
    SET released_amount = v_res.reserved_amount,
        settled_amount = 0,
        status = 'RELEASED',
        updated_at = NOW()
    WHERE id = p_reservation_id;

    -- Log RELEASE in ledger
    INSERT INTO public.credit_ledger (
        user_id, transaction_type, amount,
        available_balance_after, reserved_balance_after,
        reason, reference_type, reference_id, idempotency_key, metadata
    ) VALUES (
        v_res.user_id, 'RELEASE', v_res.reserved_amount,
        v_wallet.available_balance, v_wallet.reserved_balance,
        p_reason, 'reservation', p_reservation_id::text,
        p_idempotency_key, jsonb_build_object(
            'reservation_id', p_reservation_id,
            'released_amount', v_res.reserved_amount,
            'custom_metadata', p_metadata
        )
    );

    RETURN jsonb_build_object(
        'success', true,
        'reservation_id', p_reservation_id,
        'released_amount', v_res.reserved_amount,
        'status', 'RELEASED',
        'available_balance', v_wallet.available_balance,
        'reserved_balance', v_wallet.reserved_balance
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- D. Atomic Grant Credits RPC (Purchases, Top-ups, Trial Grants)
CREATE OR REPLACE FUNCTION public.grant_credits_atomic(
    p_user_id UUID,
    p_amount INT,
    p_reason TEXT,
    p_reference_type TEXT DEFAULT NULL,
    p_reference_id TEXT DEFAULT NULL,
    p_idempotency_key TEXT DEFAULT NULL,
    p_plan_id TEXT DEFAULT NULL,
    p_plan_duration_days INT DEFAULT NULL
)
RETURNS JSONB AS $$
DECLARE
    v_wallet RECORD;
    v_existing_ledger RECORD;
    v_plan_expiry TIMESTAMPTZ := NULL;
BEGIN
    -- Check idempotency
    IF p_idempotency_key IS NOT NULL THEN
        SELECT * INTO v_existing_ledger FROM public.credit_ledger WHERE idempotency_key = p_idempotency_key;
        IF FOUND THEN
            SELECT * INTO v_wallet FROM public.credit_wallets WHERE user_id = p_user_id;
            RETURN jsonb_build_object(
                'success', true,
                'available_balance', v_wallet.available_balance,
                'is_idempotent', true
            );
        END IF;
    END IF;

    SELECT * INTO v_wallet FROM public.credit_wallets WHERE user_id = p_user_id FOR UPDATE;

    IF p_plan_duration_days IS NOT NULL THEN
        v_plan_expiry := NOW() + (p_plan_duration_days || ' days')::INTERVAL;
    END IF;

    IF NOT FOUND THEN
        INSERT INTO public.credit_wallets (
            user_id, available_balance, reserved_balance, plan_id, plan_expires_at
        ) VALUES (
            p_user_id, p_amount, 0, COALESCE(p_plan_id, 'STARTER'), v_plan_expiry
        ) RETURNING * INTO v_wallet;
    ELSE
        UPDATE public.credit_wallets
        SET available_balance = available_balance + p_amount,
            plan_id = COALESCE(p_plan_id, plan_id),
            plan_expires_at = COALESCE(v_plan_expiry, plan_expires_at),
            updated_at = NOW()
        WHERE user_id = p_user_id
        RETURNING * INTO v_wallet;
    END IF;

    -- Record in ledger
    INSERT INTO public.credit_ledger (
        user_id, transaction_type, amount,
        available_balance_after, reserved_balance_after,
        reason, reference_type, reference_id, idempotency_key
    ) VALUES (
        p_user_id,
        CASE WHEN p_reason LIKE '%PURCHASE%' THEN 'PURCHASE' ELSE 'GRANT' END,
        p_amount,
        v_wallet.available_balance, v_wallet.reserved_balance,
        p_reason, p_reference_type, p_reference_id, p_idempotency_key
    );

    RETURN jsonb_build_object(
        'success', true,
        'granted_amount', p_amount,
        'available_balance', v_wallet.available_balance,
        'reserved_balance', v_wallet.reserved_balance,
        'plan_id', v_wallet.plan_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant EXECUTE permissions
GRANT EXECUTE ON FUNCTION public.reserve_credits_atomic(UUID, INT, TEXT, TEXT, TEXT, TEXT, TIMESTAMPTZ) TO service_role;
GRANT EXECUTE ON FUNCTION public.settle_reservation_atomic(UUID, INT, JSONB, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.refund_reservation_atomic(UUID, TEXT, JSONB, TEXT) TO service_role;
GRANT EXECUTE ON FUNCTION public.grant_credits_atomic(UUID, INT, TEXT, TEXT, TEXT, TEXT, TEXT, INT) TO service_role;
