-- Drop existing functions to avoid return type conflicts
DROP FUNCTION IF EXISTS public.generate_whatsapp_code(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.verify_whatsapp_code(TEXT, TEXT);

-- Create saas_config table if not exists
CREATE TABLE IF NOT EXISTS public.saas_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Seed n8n webhook URL
INSERT INTO public.saas_config (key, value, description)
VALUES ('n8n_whatsapp_webhook_url', 'https://n8n.olamundodigital.cloud/webhook/otp-send', 'URL do webhook n8n para envio de OTP via WhatsApp')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- Enable RLS on saas_config
ALTER TABLE public.saas_config ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public profiles can read config" ON public.saas_config;
CREATE POLICY "Public profiles can read config" ON public.saas_config FOR SELECT USING (true);

-- Tabela para gerenciar os códigos de 6 dígitos
CREATE TABLE IF NOT EXISTS public.verification_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone TEXT NOT NULL,
    code TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, verified, expired
    created_at TIMESTAMPTZ DEFAULT now(),
    expires_at TIMESTAMPTZ DEFAULT (now() + interval '10 minutes'), -- Aumentado para 10 min
    ct_id UUID REFERENCES public.cts(id)
);

-- Function to generate a WhatsApp verification code
CREATE OR REPLACE FUNCTION public.generate_whatsapp_code(p_email TEXT, p_whatsapp TEXT)
RETURNS JSONB AS $$
DECLARE
    v_code TEXT;
    v_ct_id UUID;
BEGIN
    -- 1. Tentar pegar o CT ID se o e-mail for fornecido
    IF p_email IS NOT NULL AND p_email <> '' THEN
        SELECT ct_id INTO v_ct_id FROM public.profiles WHERE email = p_email LIMIT 1;
    END IF;
    
    -- 2. Gerar código de 6 dígitos
    v_code := lpad(floor(random() * 1000000)::text, 6, '0');
    
    -- 3. Invalidar códigos pendentes anteriores para este número
    UPDATE public.verification_codes 
    SET status = 'expired' 
    WHERE phone = p_whatsapp AND status = 'pending';
    
    -- 4. Inserir novo código
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
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to verify a WhatsApp code
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

    IF v_record IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Código inválido ou expirado'
        );
    END IF;

    -- Marcar como verificado
    UPDATE public.verification_codes 
    SET status = 'verified' 
    WHERE id = v_record.id;

    -- Se o perfil existe, atualizar metadata ou status
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
        'message', SQLERRM
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grants explícitos para evitar erros de permissão 400/403
GRANT EXECUTE ON FUNCTION public.generate_whatsapp_code(TEXT, TEXT) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.verify_whatsapp_code(TEXT, TEXT) TO anon, authenticated, service_role;

-- RLS para a tabela de códigos
ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anon can insert verification codes via RPC" ON public.verification_codes;
CREATE POLICY "Anon can insert verification codes via RPC" ON public.verification_codes FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Anyone can select codes for verification" ON public.verification_codes;
CREATE POLICY "Anyone can select codes for verification" ON public.verification_codes FOR SELECT USING (true);
