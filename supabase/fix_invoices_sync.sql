-- Migration: Fix Invoices Relationship and Synchronization

-- 1. Ensure Dependencies
CREATE SEQUENCE IF NOT EXISTS public.invoice_number_seq START 1;

CREATE OR REPLACE FUNCTION public.generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    seq_val BIGINT;
BEGIN
    SELECT nextval('public.invoice_number_seq') INTO seq_val;
    RETURN 'INV-' || LPAD(seq_val::TEXT, 6, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Fix Foreign Key (Switch from auth.users to public.users)
ALTER TABLE public.invoices
DROP CONSTRAINT IF EXISTS invoices_user_id_fkey;

ALTER TABLE public.invoices
ADD CONSTRAINT invoices_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE;

-- 2b. Add subscription_id and invoice_url to invoices
ALTER TABLE public.invoices
ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES public.subscriptions (id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS invoice_url TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'INR';

-- Ensure one invoice per subscription
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_invoices_subscription_unique') THEN
        CREATE UNIQUE INDEX idx_invoices_subscription_unique ON public.invoices (subscription_id) WHERE subscription_id IS NOT NULL;
    END IF;
END $$;

-- 3. Create a function to auto-generate invoices from subscriptions
CREATE OR REPLACE FUNCTION public.sync_subscription_invoice()
RETURNS TRIGGER AS $$
DECLARE
    new_v_invoice_number TEXT;
    v_amount INTEGER := 0;
    v_currency TEXT := 'INR';
    v_billing_name TEXT;
    v_billing_email TEXT;
    v_billing_phone TEXT;
    v_billing_address TEXT;
    v_billing_city TEXT;
    v_billing_state TEXT;
    v_billing_country TEXT;
    v_billing_zip TEXT;
BEGIN
    -- Only for active subscriptions
    IF NEW.status = 'active' THEN
        -- Check if invoice already exists for this subscription
        IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE subscription_id = NEW.id) THEN
            
            -- Generate invoice number
            new_v_invoice_number := public.generate_invoice_number();
            
            -- Try to find payment info to get amount
            -- Check payments first, then orders as fallback
            SELECT amount, currency INTO v_amount, v_currency 
            FROM public.payments 
            WHERE user_id = NEW.user_id 
            ORDER BY created_at DESC LIMIT 1;
            
            -- Try to find billing info
            SELECT 
                full_name, email, phone, address, city, state, country, zip_code 
            INTO 
                v_billing_name, v_billing_email, v_billing_phone, v_billing_address, v_billing_city, v_billing_state, v_billing_country, v_billing_zip
            FROM public.billing_details 
            WHERE user_id = NEW.user_id 
            ORDER BY created_at DESC LIMIT 1;

            -- Insert Invoice
            INSERT INTO public.invoices (
                invoice_number,
                user_id,
                subscription_id,
                plan,
                amount,
                currency,
                payment_method,
                coupon_code,
                status,
                billing_name,
                billing_email,
                billing_phone,
                billing_address,
                billing_city,
                billing_state,
                billing_country,
                billing_zip,
                created_at
            ) VALUES (
                new_v_invoice_number,
                NEW.user_id,
                NEW.id,
                NEW.plan,
                COALESCE(v_amount, 0),
                COALESCE(v_currency, 'INR'),
                CASE WHEN NEW.coupon_code IS NOT NULL THEN 'coupon' ELSE 'razorpay' END,
                NEW.coupon_code,
                'paid',
                v_billing_name,
                v_billing_email,
                v_billing_phone,
                v_billing_address,
                v_billing_city,
                v_billing_state,
                v_billing_country,
                v_billing_zip,
                NEW.created_at
            ) ON CONFLICT (subscription_id) DO NOTHING;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Create Trigger
DROP TRIGGER IF EXISTS tr_sync_subscription_invoice ON public.subscriptions;

CREATE TRIGGER tr_sync_subscription_invoice
AFTER INSERT OR UPDATE ON public.subscriptions
FOR EACH ROW EXECUTE FUNCTION public.sync_subscription_invoice();

-- 5. Manual sync helper
CREATE OR REPLACE FUNCTION public.sync_subscription_invoice_manual(p_sub_id UUID)
RETURNS VOID AS $$
DECLARE
    v_sub RECORD;
    v_invoice_number TEXT;
    v_amount INTEGER := 0;
    v_currency TEXT := 'INR';
    v_billing_name TEXT;
    v_billing_email TEXT;
    v_billing_phone TEXT;
    v_billing_address TEXT;
    v_billing_city TEXT;
    v_billing_state TEXT;
    v_billing_country TEXT;
    v_billing_zip TEXT;
BEGIN
    SELECT * INTO v_sub FROM public.subscriptions WHERE id = p_sub_id;
    IF v_sub.id IS NOT NULL THEN
            IF NOT EXISTS (SELECT 1 FROM public.invoices WHERE subscription_id = v_sub.id) THEN
                v_invoice_number := public.generate_invoice_number();
                
                SELECT amount, currency INTO v_amount, v_currency 
                FROM public.payments 
                WHERE user_id = v_sub.user_id 
                ORDER BY created_at DESC LIMIT 1;
                
                SELECT 
                    full_name, email, phone, address, city, state, country, zip_code 
                INTO 
                    v_billing_name, v_billing_email, v_billing_phone, v_billing_address, v_billing_city, v_billing_state, v_billing_country, v_billing_zip
                FROM public.billing_details 
                WHERE user_id = v_sub.user_id 
                ORDER BY created_at DESC LIMIT 1;

                INSERT INTO public.invoices (
                    invoice_number, user_id, subscription_id, plan, amount, currency, payment_method, coupon_code, status,
                    billing_name, billing_email, billing_phone, billing_address, billing_city, billing_state, billing_country, billing_zip, created_at
                ) VALUES (
                    v_invoice_number, v_sub.user_id, v_sub.id, v_sub.plan, COALESCE(v_amount, 0), COALESCE(v_currency, 'INR'),
                    CASE WHEN v_sub.coupon_code IS NOT NULL THEN 'coupon' ELSE 'razorpay' END, v_sub.coupon_code, 'paid',
                    v_billing_name, v_billing_email, v_billing_phone, v_billing_address, v_billing_city, v_billing_state, v_billing_country, v_billing_zip, v_sub.created_at
                ) ON CONFLICT (subscription_id) DO NOTHING;
            END IF;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Fallback: Run for existing
DO $$
DECLARE
    sub RECORD;
BEGIN
    FOR sub IN SELECT id FROM public.subscriptions WHERE status = 'active' LOOP
        PERFORM public.sync_subscription_invoice_manual(sub.id);
    END LOOP;
END $$;