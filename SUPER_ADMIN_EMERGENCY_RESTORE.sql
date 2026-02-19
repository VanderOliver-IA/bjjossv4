-- ==========================================
-- SUPER_ADMIN_EMERGENCY_RESTORE.sql
-- Restaurar acesso total do Super Admin e corrigir RLS global
-- ==========================================

-- 1. Garantir que o metadado do JWT no Auth está correto (Super Admin)
-- Nota: Isso só pode ser feito via SQL no Supabase se você tiver as permissões certas, 
-- mas o script abaixo garante a role no banco.
DO $$ 
DECLARE
    v_user_id UUID;
BEGIN
    SELECT id INTO v_user_id FROM auth.users WHERE email = 'omd.vandersonoliveira@gmail.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Garante a role interna
        DELETE FROM public.user_roles WHERE user_id = v_user_id;
        INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'super_admin');
        
        -- Garante que o profile existe e está vinculado
        IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = v_user_id) THEN
            INSERT INTO public.profiles (id, name, email, user_id)
            VALUES (v_user_id, 'Vanderson Oliveira', 'omd.vandersonoliveira@gmail.com', v_user_id);
        END IF;
    END IF;
END $$;

-- 2. Limpeza e Reconstrução de Funções de Apoio (EVITANDO RECURSÃO)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  -- Tenta ler do JWT primeiro (performance e bypass de RLS)
  -- Se não estiver no JWT, busca na tabela delegando para SECURITY DEFINER
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', ''),
    (SELECT role::text FROM public.user_roles WHERE user_id = auth.uid() LIMIT 1)
  )::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. Resetar e Aplicar RLS para Tabelas Críticas
DO $$ 
DECLARE 
    tbl TEXT;
BEGIN
    FOR tbl IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename IN ('cts', 'saas_leads', 'profiles', 'user_roles', 'saas_config')
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', tbl);
        EXECUTE format('DROP POLICY IF EXISTS "Super Admin Full Access" ON public.%I', tbl);
        EXECUTE format('CREATE POLICY "Super Admin Full Access" ON public.%I FOR ALL TO authenticated USING (public.is_super_admin())', tbl);
    END LOOP;
END $$;

-- 4. Políticas de Visibilidade para Usuários Comuns (Isolamento por CT)
DROP POLICY IF EXISTS "CTs - View Own" ON public.cts;
CREATE POLICY "CTs - View Own" ON public.cts FOR SELECT TO authenticated 
USING (id IN (SELECT ct_id FROM public.profiles WHERE id = auth.uid()));

DROP POLICY IF EXISTS "Profiles - View Own" ON public.profiles;
CREATE POLICY "Profiles - View Own" ON public.profiles FOR SELECT TO authenticated 
USING (id = auth.uid());

-- 5. Garantir que o Super Admin consegue inserir Leads
DROP POLICY IF EXISTS "Public Lead Insert" ON public.saas_leads;
CREATE POLICY "Public Lead Insert" ON public.saas_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

-- 6. Grant Permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;

SELECT 'Saneamento Completo! Super Admin restaurado.' as status;
