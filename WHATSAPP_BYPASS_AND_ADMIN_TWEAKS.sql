-- AJUSTE FINO: VERIFICAÇÃO WHATSAPP E ATIVAÇÃO POR SUPER ADMIN
-- 1. Atualizar RPC para já ativar com WhatsApp verificado
CREATE OR REPLACE FUNCTION public.activate_lead_account(p_lead_id UUID, p_gym_name TEXT)
RETURNS JSONB AS $$
DECLARE
    v_lead RECORD;
    v_user_id UUID;
    v_ct_id UUID;
BEGIN
    SELECT * INTO v_lead FROM public.saas_leads WHERE id = p_lead_id;
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Lead não encontrado');
    END IF;

    SELECT id INTO v_user_id FROM auth.users WHERE email = v_lead.email;
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Usuário ainda não criou conta no sistema');
    END IF;

    -- Criar Academia
    INSERT INTO public.cts (name, owner_id, status, trial_ends_at)
    VALUES (p_gym_name, v_user_id, 'active', now() + interval '7 days')
    RETURNING id INTO v_ct_id;

    -- VINCULAR PERFIL (Marcando já como verificado)
    UPDATE public.profiles 
    SET ct_id = v_ct_id,
        whatsapp_verified = true
    WHERE id = v_user_id;

    -- Definir Role no public.user_roles
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role) VALUES (v_user_id, 'admin_ct');
    
    -- ATUALIZAR AUTH METADATA (Bypass de verificação e role)
    UPDATE auth.users 
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "admin_ct"}'::jsonb,
        raw_user_meta_data = raw_user_meta_data || jsonb_build_object('gym_name', p_gym_name, 'whatsapp_verified', true)
    WHERE id = v_user_id;

    UPDATE public.saas_leads SET status = 'registered' WHERE id = p_lead_id;

    RETURN jsonb_build_object('success', true, 'ct_id', v_ct_id);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. MARCAR SUPER ADMIN E CONTAS EXISTENTES COMO VERIFICADAS
-- Isso garante que você não seja deslogado agora.
UPDATE public.profiles 
SET whatsapp_verified = true 
WHERE email = 'omd.vandersonoliveira@gmail.com';

-- Opcional: Marcar todos os que já possuem ct_id como verificados (já são clientes)
UPDATE public.profiles 
SET whatsapp_verified = true 
WHERE ct_id IS NOT NULL;
