-- ================================================================
-- REFINEMENT_SAAS_PRIVACY_AND_CRM.sql
-- Foco: Privacidade Admin, Ativação de Conta e Captura Automática
-- ================================================================

-- 1. ADICIONAR COLUNA DE SESSÃO DE SUPORTE NO AUTH (CONTEXTO)
-- Usaremos o metadado 'view_as_ct' que já implementamos no frontend.

-- 2. BLINDAGEM DE RLS (PRIVACIDADE POR PADRÃO)
-- Se for Super Admin, ele só vê dados se estiver 'simulando' ou se for dado próprio.

-- Exemplo para Alunos (Repetir para Turmas, Financeiro, etc.)
DROP POLICY IF EXISTS "Super admins can view all profiles" ON public.profiles;
CREATE POLICY "Super admin privacy policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
    (auth.jwt() -> 'app_metadata' ->> 'role' = 'super_admin' AND (
        -- So vê se estiver com CT selecionado (Modo Suporte)
        ct_id::text = (auth.jwt() -> 'user_metadata' ->> 'view_as_ct')
        OR id = auth.uid()
    ))
    OR (auth.jwt() -> 'app_metadata' ->> 'role' != 'super_admin' AND ct_id = (SELECT ct_id FROM public.profiles WHERE id = auth.uid()))
);

-- 3. TRIGGER: CAPTURA AUTOMÁTICA DE TODOS OS CADASTROS
CREATE OR REPLACE FUNCTION public.handle_new_user_lead()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.saas_leads (name, email, whatsapp, source, status)
    VALUES (
        COALESCE(new.raw_user_meta_data->>'full_name', 'Usuário Novo'),
        new.email,
        COALESCE(new.raw_user_meta_data->>'whatsapp', ''),
        'signup',
        'new'
    )
    ON CONFLICT (email) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created_lead ON auth.users;
CREATE TRIGGER on_auth_user_created_lead
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_lead();

-- 4. RPC: ATIVAR CONTA DE LEAD (CONVERSÃO LEAD -> ACADEMIA)
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
        RETURN jsonb_build_object('success', false, 'message', 'Usuário ainda não criou conta no sistema');
    END IF;

    -- 3. Criar a Academia (CT)
    INSERT INTO public.cts (name, owner_id, status, trial_ends_at)
    VALUES (p_gym_name, v_user_id, 'active', now() + interval '7 days')
    RETURNING id INTO v_ct_id;

    -- 4. Vincular usuário ao novo CT e dar cargo de admin_ct
    UPDATE public.profiles 
    SET ct_id = v_ct_id 
    WHERE id = v_user_id;

    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin_ct');
    
    UPDATE auth.users 
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin_ct"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || jsonb_build_object('gym_name', p_gym_name)
    WHERE id = v_user_id;

    -- 5. Atualizar status do lead
    UPDATE public.saas_leads SET status = 'registered' WHERE id = p_lead_id;

    RETURN jsonb_build_object('success', true, 'ct_id', v_ct_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
