-- Add optional fields to project_experts
ALTER TABLE public.project_experts 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS domains TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS availability BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';

-- Create public.project_quotations
CREATE TABLE IF NOT EXISTS public.project_quotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    quotation_number TEXT UNIQUE NOT NULL,
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    additional_charges NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    tax NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    final_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    due_date DATE,
    status TEXT NOT NULL DEFAULT 'Draft', -- Draft, Sent, Approved, Rejected
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for quotations
ALTER TABLE public.project_quotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for owner and admin on quotations"
ON public.project_quotations FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow write for admin on quotations"
ON public.project_quotations FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));


-- Create public.project_payments
CREATE TABLE IF NOT EXISTS public.project_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    invoice_id UUID REFERENCES public.project_invoices(id) ON DELETE SET NULL,
    transaction_id TEXT,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    razorpay_signature TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Paid, Failed, Refunded
    payment_method TEXT,
    payment_date TIMESTAMPTZ,
    receipt_url TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for payments
ALTER TABLE public.project_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for owner and admin on payments"
ON public.project_payments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow write for admin and system on payments"
ON public.project_payments FOR ALL TO authenticated
USING (true)
WITH CHECK (true);


-- Create public.project_activity
CREATE TABLE IF NOT EXISTS public.project_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- Project Created, Expert Assigned, Status Changed, etc.
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for activity logs
ALTER TABLE public.project_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for owner and admin on activity"
ON public.project_activity FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow insert for authenticated users on activity"
ON public.project_activity FOR INSERT TO authenticated
WITH CHECK (true);


-- Create public.project_settings
CREATE TABLE IF NOT EXISTS public.project_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for settings
ALTER TABLE public.project_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read for authenticated on settings"
ON public.project_settings FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow write for admin on settings"
ON public.project_settings FOR ALL TO authenticated
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

-- Populate default project settings
INSERT INTO public.project_settings (key, value) VALUES 
('pricing', '{"default_major": 15000, "default_minor": 8000, "default_mini": 4000, "currency": "INR", "tax_percent": 18}'),
('urgency_multipliers', '{"Normal": 1.0, "Urgent": 1.25, "Critical": 1.5}'),
('prefixes', '{"quotation": "QTN-PRJ-", "invoice": "INV-PRJ-", "project": "PRJ-"}'),
('file_restrictions', '{"allowed_types": ["pdf", "docx", "zip", "png", "jpg"], "max_size_mb": 15}')
ON CONFLICT (key) DO NOTHING;
