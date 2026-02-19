-- ==========================================
-- FINAL_FIX_RECURSION_V2.sql
-- Resgate final do Super Admin e Saneamento Global
-- ==========================================

-- 1. DESABILITAR RLS TEMPORARIAMENTE PARA LIMPEZA
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

-- 2. FUNÇÃO DE ROLE ULTRA-SEGURA (SEM CONSULTA A TABELA)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 3. RE-ATIVAR E APLICAR POLÍTICAS BLINDADAS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Limpeza de políticas circulares
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'user_roles', 'cts', 'saas_leads')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(r.policyname) || ' ON ' || quote_ident(r.tablename);
    END LOOP;
END $$;

-- Políticas Profiles
CREATE POLICY "Super Admin Tudo" ON public.profiles FOR ALL TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "Ver próprio perfil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Atualizar próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- Políticas User Roles
CREATE POLICY "Super Admin Roles" ON public.user_roles FOR ALL TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "Ver próprio papel" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 4. ATUALIZAR RPC DE ATIVAÇÃO (AJUSTADO PARA COLUNAS REAIS DA TABELA CTS)
CREATE OR REPLACE FUNCTION public.activate_lead_account(p_lead_id UUID, p_gym_name TEXT)
RETURNS JSONB AS $$
DECLARE
    v_lead RECORD;
    v_user_id UUID;
    v_ct_id UUID;
BEGIN
    -- 1. Buscar dados do lead
    SELECT * INTO v_lead FROM public.saas_leads WHERE id = p_lead_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lead não encontrado');
    END IF;

    -- 2. Buscar ID do usuário no Auth pelo email
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_lead.email;

    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'O email ' || v_lead.email || ' ainda não está cadastrado no sistema.');
    END IF;

    -- 3. Criar a Academia (CT) - Colunas revisadas: name, address, phone, email, subscription, subscription_status
    INSERT INTO public.cts (name, address, phone, email, subscription, subscription_status, created_at)
    VALUES (
        p_gym_name, 
        'Endereço a definir', 
        v_lead.whatsapp, 
        v_lead.email, 
        'pro', 
        'ativo',
        now()
    )
    RETURNING id INTO v_ct_id;

    -- 4. Vincular usuário e dar cargo
    UPDATE public.profiles 
    SET ct_id = v_ct_id,
        whatsapp_verified = true
    WHERE id = v_user_id;

    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin_ct');
    
    UPDATE auth.users 
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin_ct"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || jsonb_build_object('gym_name', p_gym_name, 'whatsapp_verified', true)
    WHERE id = v_user_id;

    -- 5. Atualizar status do lead
    UPDATE public.saas_leads SET status = 'converted' WHERE id = p_lead_id;

    RETURN jsonb_build_object('success', true, 'ct_id', v_ct_id, 'message', 'CONTA ATIVADA COM SUCESSO!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. POPULAR ALGUNS CTs PARA O DASHBOARD (Visão Fevereiro)
INSERT INTO public.cts (name, address, phone, email, subscription, subscription_status, created_at)
VALUES 
  ('Gracie Barra Matriz', 'Rio de Janeiro, RJ', '21999998888', 'contato@graciebarra.com', 'pro', 'ativo', '2025-11-01'),
  ('Alliance SP', 'São Paulo, SP', '11999997777', 'contato@alliance.com', 'pro', 'ativo', '2025-12-15'),
  ('Checkmat Rio', 'Rio de Janeiro, RJ', '21999996666', 'contato@checkmat.com', 'pro', 'ativo', '2026-01-20');

SELECT 'Saneamento V2 concluído!' as status;
