-- Limpeza para garantir a estrutura correta (v3 robusta)
DROP FUNCTION IF EXISTS public.generate_whatsapp_code(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_whatsapp_code(TEXT, TEXT);
DROP TABLE IF EXISTS public.verification_codes;

-- Recriar tabela com a estrutura oficial
CREATE TABLE public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '10 minutes'),
    ct_id UUID REFERENCES public.cts(id)
);

-- Recriar a função de geração com tratamento de e-mail opcional
CREATE OR REPLACE FUNCTION public.generate_whatsapp_code(p_email TEXT, p_whatsapp TEXT)
RETURNS JSONB AS $$
DECLARE
    v_code TEXT;
    v_ct_id UUID;
BEGIN
    -- 1. Buscar CT_ID se disponível
    IF p_email IS NOT NULL AND p_email <> '' THEN
        SELECT ct_id INTO v_ct_id FROM public.profiles WHERE email = p_email LIMIT 1;
    END IF;
    
    -- 2. Gerar código de 6 dígitos
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');
    
    -- 3. Inserir na tabela
    INSERT INTO public.verification_codes (phone, code, ct_id)
    VALUES (p_whatsapp, v_code, v_ct_id);

    RETURN jsonb_build_object(
        'success', true,
        'code', v_code,
        'message', 'Código gerado com sucesso',
        'expires_in_minutes', 10
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'DB Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função de verificação
CREATE OR REPLACE FUNCTION public.verify_whatsapp_code(p_email TEXT, p_code TEXT)
RETURNS JSONB AS $$
DECLARE
    v_record RECORD;
BEGIN
    SELECT * INTO v_record 
    FROM public.verification_codes 
    WHERE code = p_code 
      AND status = 'pending'
      AND expires_at > now()
    ORDER BY created_at DESC 
    LIMIT 1;

    IF v_record.id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Código inválido ou expirado'
        );
    END IF;

    UPDATE public.verification_codes 
    SET status = 'verified' 
    WHERE id = v_record.id;

    IF p_email IS NOT NULL AND p_email <> '' THEN
        UPDATE public.profiles 
        SET updated_at = now()
        WHERE email = p_email;
    END IF;

    RETURN jsonb_build_object(
        'success', true,
        'message', 'Verificado com sucesso'
    );
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', 'DB Error: ' || SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants explícitos 
GRANT EXECUTE ON FUNCTION public.generate_whatsapp_code(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_whatsapp_code(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT ALL ON public.verification_codes TO anon, authenticated, service_role;

-- RLS
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can manage verification" ON public.verification_codes;
CREATE POLICY "Public can manage verification" ON public.verification_codes FOR ALL USING (true);
