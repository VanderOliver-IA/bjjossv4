-- ====================================================================
-- FINAL FIX: Corretiva de RLS + Reinserir dados faltantes
-- Rode este script no SQL Editor do Supabase
-- ====================================================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE para inserir dados
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

-- 2. AJUSTAR SCHEMA (Adicionar colunas faltantes se necessário)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='cts' AND column_name='subscription_status') THEN
        ALTER TABLE public.cts ADD COLUMN subscription_status TEXT DEFAULT 'ativo';
    END IF;
END $$;

-- 2.2 LIMPAR POLICIES ANTIGAS
DO $$
BEGIN
  EXECUTE 'DROP POLICY IF EXISTS "Super Admin Access" ON public.cts';
  EXECUTE 'DROP POLICY IF EXISTS "CT Member Access" ON public.cts';
  EXECUTE 'DROP POLICY IF EXISTS "Super Admin Access" ON public.profiles';
  EXECUTE 'DROP POLICY IF EXISTS "CT Member Access" ON public.profiles';
END $$;

-- 3. INSERIR CTs FALTANTES
INSERT INTO public.cts (id, name, slug, subscription, subscription_status, features, active)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brasília BJJ Central', 'brasilia-bjj', 'enterprise', 'ativo', '{"crm": true, "financeiro": true}', true),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Alliance Jardins', 'alliance-jardins', 'premium', 'ativo', '{"valet": true}', true),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Gracie Barra Sul', 'gb-sul', 'standard', 'ativo', '{}', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, subscription_status = EXCLUDED.subscription_status;

-- 4. INSERIR PROFILES FALTANTES (vinculados aos auth.users existentes)
INSERT INTO public.profiles (id, ct_id, name, email)
SELECT u.id, 
  CASE 
    WHEN u.email = 'super@bjjoss.com' THEN NULL
    ELSE 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
  END,
  CASE
    WHEN u.email = 'super@bjjoss.com' THEN 'Super Admin Global'
    WHEN u.email = 'admin@brasilia.com' THEN 'Ricardo Silva'
    WHEN u.email = 'prof@brasilia.com' THEN 'Rodrigo Santos'
    WHEN u.email = 'atendente@brasilia.com' THEN 'Maria Alves'
    WHEN u.email = 'aluno@brasilia.com' THEN 'João Aluno'
  END,
  u.email
FROM auth.users u
WHERE u.email IN ('super@bjjoss.com', 'admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. GARANTIR user_roles (caso algum tenha falhado)
INSERT INTO public.user_roles (user_id, role)
SELECT u.id,
  CASE
    WHEN u.email = 'super@bjjoss.com' THEN 'super_admin'::app_role
    WHEN u.email = 'admin@brasilia.com' THEN 'admin_ct'::app_role
    WHEN u.email = 'prof@brasilia.com' THEN 'professor'::app_role
    WHEN u.email = 'atendente@brasilia.com' THEN 'atendente'::app_role
    WHEN u.email = 'aluno@brasilia.com' THEN 'aluno'::app_role
  END
FROM auth.users u
WHERE u.email IN ('super@bjjoss.com', 'admin@brasilia.com', 'prof@brasilia.com', 'atendente@brasilia.com', 'aluno@brasilia.com')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. SEED: Alunos de exemplo
INSERT INTO public.students (ct_id, name, email, status, graduation_level) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pedro Henrique', 'pedro@email.com', 'ativo', 'azul'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Clara', 'ana@email.com', 'ativo', 'branca'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Marcos Paulo', 'marcos@email.com', 'inativo', 'roxa'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fernanda Lima', 'fer@email.com', 'ativo', 'marrom'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Lucas Gurgel', 'lucas@alliance.com', 'ativo', 'preta')
ON CONFLICT DO NOTHING;

-- 7. SEED: Turmas de exemplo
INSERT INTO public.training_classes (ct_id, professor_id, name, time_start, time_end, days)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 
  u.id, 'Jiu Jitsu Manhã', '07:00', '08:30', '{1,3,5}'
FROM auth.users u WHERE u.email = 'prof@brasilia.com'
ON CONFLICT DO NOTHING;

INSERT INTO public.training_classes (ct_id, professor_id, name, time_start, time_end, days)
SELECT 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid, 
  u.id, 'No-Gi Submission', '19:00', '20:30', '{2,4}'
FROM auth.users u WHERE u.email = 'prof@brasilia.com'
ON CONFLICT DO NOTHING;

-- 8. REABILITAR RLS COM POLICIES CORRETAS
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 9. CRIAR POLICIES UNIVERSAIS (permitem leitura autenticada, escrita por admin)
-- Helper functions
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_ct_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ct_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Profiles: Users can read their own profile, super_admin reads all
CREATE POLICY "profiles_select" ON public.profiles FOR SELECT
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE
  USING (id = auth.uid() OR public.is_super_admin());

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT
  WITH CHECK (true);

-- CTs: Super admin sees all, CT members see their own
CREATE POLICY "cts_select" ON public.cts FOR SELECT
  USING (public.is_super_admin() OR id = public.get_user_ct_id());

CREATE POLICY "cts_all_admin" ON public.cts FOR ALL
  USING (public.is_super_admin());

-- User Roles: Users can read their own role, super_admin reads all
CREATE POLICY "roles_select" ON public.user_roles FOR SELECT
  USING (user_id = auth.uid() OR public.is_super_admin());

CREATE POLICY "roles_all_admin" ON public.user_roles FOR ALL
  USING (public.is_super_admin());

-- Students: CT-scoped
CREATE POLICY "students_select" ON public.students FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "students_all" ON public.students FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

-- Training Classes: CT-scoped
CREATE POLICY "classes_select" ON public.training_classes FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "classes_all" ON public.training_classes FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

-- Products: CT-scoped
CREATE POLICY "products_select" ON public.products FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "products_all" ON public.products FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

-- Financial Transactions: CT-scoped
CREATE POLICY "finance_select" ON public.financial_transactions FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "finance_all" ON public.financial_transactions FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

-- Leads: CT-scoped
CREATE POLICY "leads_select" ON public.leads FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "leads_all" ON public.leads FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

-- Audit Logs: Super admin only
CREATE POLICY "audit_select" ON public.audit_logs FOR SELECT
  USING (public.is_super_admin());

CREATE POLICY "audit_insert" ON public.audit_logs FOR INSERT
  WITH CHECK (true);

-- Attendance: CT-scoped
CREATE POLICY "attendance_select" ON public.attendance_records FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "attendance_all" ON public.attendance_records FOR ALL
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "att_students_select" ON public.attendance_students FOR SELECT
  USING (true);

CREATE POLICY "att_students_all" ON public.attendance_students FOR ALL
  USING (true);

-- Role Permissions: CT-scoped
CREATE POLICY "perms_select" ON public.role_permissions FOR SELECT
  USING (public.is_super_admin() OR ct_id = public.get_user_ct_id());

CREATE POLICY "perms_all" ON public.role_permissions FOR ALL
  USING (public.is_super_admin());

-- Feature Flags (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'feature_flags') THEN
    EXECUTE 'ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY';
    EXECUTE 'CREATE POLICY "flags_select" ON public.feature_flags FOR SELECT USING (true)';
    EXECUTE 'CREATE POLICY "flags_all" ON public.feature_flags FOR ALL USING (public.is_super_admin())';
  END IF;
END $$;

-- 10. Confirmação
DO $$
BEGIN
  RAISE NOTICE '✅ SCHEMA REPARADO! CTs, Profiles e RLS configurados corretamente.';
END $$;
