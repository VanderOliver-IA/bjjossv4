-- ====================================================================
-- RESET TOTAL DE RLS - Abordagem minimalista para desbloquear o login
-- Cole e execute no SQL Editor do Supabase
-- ====================================================================

-- 1. DESABILITAR RLS em TODAS as tabelas (acesso total temporário)
ALTER TABLE public.cts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions DISABLE ROW LEVEL SECURITY;

-- 2. REMOVER TODAS as policies existentes (limpar slate)
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN 
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- 3. REMOVER funções helper que podem estar causando loop
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_ct_id() CASCADE;

-- 4. RECRIAR funções helper de forma mais simples e segura
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = auth.uid() AND role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_ct_id()
RETURNS uuid 
LANGUAGE sql 
SECURITY DEFINER 
STABLE
SET search_path = public
AS $$
  SELECT ct_id FROM public.profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 5. REABILITAR RLS com policies SIMPLES (sem dependência circular)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_own_profile" ON public.profiles
  FOR ALL USING (auth.uid() = id);
CREATE POLICY "allow_super_admin_profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin());

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_own_role" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "allow_super_admin_roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin());

ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_cts" ON public.cts
  FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "allow_super_admin_cts" ON public.cts
  FOR ALL USING (public.is_super_admin());

ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_students" ON public.students
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_classes" ON public.training_classes
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_products" ON public.products
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_finance" ON public.financial_transactions
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_leads" ON public.leads
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_audit" ON public.audit_logs
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_attendance" ON public.attendance_records
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.attendance_students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_att_students" ON public.attendance_students
  FOR ALL USING (auth.role() = 'authenticated');

ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_authenticated_perms" ON public.role_permissions
  FOR ALL USING (auth.role() = 'authenticated');

-- 6. CONFIRMAR estado final
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
