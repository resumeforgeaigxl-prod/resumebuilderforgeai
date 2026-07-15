-- Create public.project_experts
CREATE TABLE IF NOT EXISTS public.project_experts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    specialization TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project_experts
ALTER TABLE public.project_experts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for authenticated users on project_experts" 
ON public.project_experts FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow all access for admin users on project_experts" 
ON public.project_experts FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));


-- Create public.project_requests
CREATE TABLE IF NOT EXISTS public.project_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id TEXT UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    whatsapp TEXT,
    college TEXT NOT NULL,
    university TEXT NOT NULL,
    branch TEXT NOT NULL,
    year TEXT NOT NULL,
    semester TEXT NOT NULL,
    project_type TEXT NOT NULL,
    project_domain TEXT NOT NULL,
    project_title TEXT NOT NULL,
    project_description TEXT NOT NULL,
    existing_abstract TEXT,
    requirements TEXT[] NOT NULL DEFAULT '{}',
    additional_requirements TEXT,
    tech_frontend TEXT,
    tech_backend TEXT,
    tech_database TEXT,
    tech_language TEXT,
    tech_ai_framework TEXT,
    tech_hosting TEXT,
    submission_date DATE,
    urgency TEXT NOT NULL,
    budget_range TEXT NOT NULL,
    project_mode TEXT NOT NULL,
    team_size INTEGER DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'Pending',
    expert_id UUID REFERENCES public.project_experts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project_requests
ALTER TABLE public.project_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for request owner" 
ON public.project_requests FOR SELECT TO authenticated 
USING (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow insert access for authenticated request owner" 
ON public.project_requests FOR INSERT TO authenticated 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow update access for owner and admin" 
ON public.project_requests FOR UPDATE TO authenticated 
USING (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));

CREATE POLICY "Allow delete access for owner and admin" 
ON public.project_requests FOR DELETE TO authenticated 
USING (user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));


-- Create public.project_files
CREATE TABLE IF NOT EXISTS public.project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project_files
ALTER TABLE public.project_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for project owners and admin" 
ON public.project_files FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow insert access for project owners and admin" 
ON public.project_files FOR INSERT TO authenticated 
WITH CHECK (uploaded_by = auth.uid() AND EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow delete access for project owners and admin" 
ON public.project_files FOR DELETE TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));


-- Create public.project_timeline
CREATE TABLE IF NOT EXISTS public.project_timeline (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project_timeline
ALTER TABLE public.project_timeline ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for project owners and admin" 
ON public.project_timeline FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow write access for admin" 
ON public.project_timeline FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));


-- Create public.project_messages
CREATE TABLE IF NOT EXISTS public.project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    sender_role TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for project_messages
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for project owners and admin" 
ON public.project_messages FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow insert access for message sender" 
ON public.project_messages FOR INSERT TO authenticated 
WITH CHECK (sender_id = auth.uid() AND EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));


-- Create public.project_deliverables
CREATE TABLE IF NOT EXISTS public.project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    version TEXT DEFAULT '1.0',
    uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for public.project_deliverables
ALTER TABLE public.project_deliverables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for project owners and admin" 
ON public.project_deliverables FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow all access for admin on deliverables" 
ON public.project_deliverables FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));


-- Create public.project_invoices
CREATE TABLE IF NOT EXISTS public.project_invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID NOT NULL REFERENCES public.project_requests(id) ON DELETE CASCADE,
    invoice_number TEXT UNIQUE NOT NULL,
    amount NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'unpaid',
    due_date DATE,
    payment_link TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for public.project_invoices
ALTER TABLE public.project_invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access for project owners and admin" 
ON public.project_invoices FOR SELECT TO authenticated 
USING (EXISTS (SELECT 1 FROM public.project_requests r WHERE r.id = request_id AND (r.user_id = auth.uid() OR auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))));

CREATE POLICY "Allow all access for admin on invoices" 
ON public.project_invoices FOR ALL TO authenticated 
USING (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'))
WITH CHECK (auth.jwt() ->> 'email' = 'saivarshith8284@gmail.com' OR EXISTS (SELECT 1 FROM public.users WHERE users.id = auth.uid() AND users.role = 'admin'));
