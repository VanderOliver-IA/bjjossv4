-- Create audit_logs table
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Super admins can view all audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_super_admin());

CREATE POLICY "CT admins can view their CT audit logs" ON public.audit_logs
  FOR SELECT USING (public.is_ct_admin(ct_id));

-- Trigger function to log changes automatically (optional, but good)
-- For now, we will log manually from the application or specific triggers.
