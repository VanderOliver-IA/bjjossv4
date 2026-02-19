-- ==========================================
-- CREATE_SUPER_ADMIN.sql (FIXED SCHEMA)
-- ==========================================
DO $$
DECLARE 
    v_email TEXT := 'omd.vandersonoliveira@gmail.com';
    v_user_id UUID;
BEGIN
    -- 1. Buscar o ID do usuário pelo email
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'ERRO: Usuário com email "%" não encontrado. Cadastre-se primeiro pelo sistema.', v_email;
    END IF;

    -- 2. Definir role no app_metadata do Auth (acesso instantâneo)
    UPDATE auth.users
    SET raw_app_meta_data = raw_app_meta_data || '{"role": "super_admin"}'::jsonb
    WHERE id = v_user_id;

    -- 3. Registrar na tabela user_roles
    DELETE FROM public.user_roles WHERE user_id = v_user_id;
    INSERT INTO public.user_roles (user_id, role)
    VALUES (v_user_id, 'super_admin');

    -- 4. Garantir que o perfil existe
    INSERT INTO public.profiles (id, email, name, whatsapp_verified)
    VALUES (v_user_id, v_email, 'Vanderson Oliveira', true)
    ON CONFLICT (id) DO UPDATE SET
        email = v_email,
        whatsapp_verified = true;

    -- 5. Super Admin não pertence a um CT específico
    UPDATE public.profiles SET ct_id = NULL WHERE id = v_user_id;

    RAISE NOTICE '=============================================';
    RAISE NOTICE '✅ SUPER ADMIN ATIVADO COM SUCESSO!';
    RAISE NOTICE '=============================================';
END $$;
