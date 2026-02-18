-- ==========================================
-- TOTAL_DATABASE_FIX_2026.sql
-- Saneamento de Recursão e Erros 500
-- ==========================================

-- 1. LIMPEZA TOTAL DE POLÍTICAS EXISTENTES
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- 2. RECONSTRUÇÃO DE FUNÇÕES DE APOIO (SEM RECURSÃO)
-- Usamos os metadados do JWT que injetamos via script para máxima performance
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE;

-- 3. POLÍTICAS PARA A TABELA PROFILES (A principal causa do Erro 500)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles - Super Admin Total" ON public.profiles
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Profiles - Ver próprio perfil" ON public.profiles
FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Profiles - Atualizar próprio perfil" ON public.profiles
FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 4. POLÍTICAS PARA USER_ROLES
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "User Roles - Super Admin Total" ON public.user_roles
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "User Roles - Ver próprio papel" ON public.user_roles
FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5. POLÍTICAS PARA CTs (Centros de Treinamento)
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "CTs - Super Admin Total" ON public.cts
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "CTs - Ver CT que pertence" ON public.cts
FOR SELECT TO authenticated 
USING (id IN (SELECT ct_id FROM public.profiles WHERE id = auth.uid()));

-- 6. POLÍTICAS PARA TABELAS DE NEGÓCIO (Students, etc)
-- Aplicando lógica de isolamento por CT
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students - Super Admin Total" ON public.students
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Students - Isolamento por CT" ON public.students
FOR ALL TO authenticated 
USING (ct_id IN (SELECT ct_id FROM public.profiles WHERE id = auth.uid()));

-- 7. REPARO DE COLUNAS DESALINHADAS (Garantindo que user_id e id existam)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='user_id') THEN
    ALTER TABLE public.profiles ADD COLUMN user_id uuid REFERENCES auth.users(id) DEFAULT auth.uid();
  END IF;
END $$;

-- Sincronizar user_id com id caso estejam nulos
UPDATE public.profiles SET user_id = id WHERE user_id IS NULL;

-- FINALIZAÇÃO
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, service_role;

SELECT 'Saneamento concluído! Teste o Dashboard agora.' as resultado;
