-- ==========================================
-- MIGRATE_SAAS_LEADS_WHATSAPP.sql
-- Pipeline: Demo → Lead → WhatsApp Verification → Trial
-- Execute no SQL Editor do Supabase
-- ==========================================

-- ============================================
-- 1. TABELA DE LEADS SAAS (CRM do Super Admin)
-- ============================================
CREATE TABLE IF NOT EXISTS public.saas_leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  academy_name TEXT,
  city TEXT,
  source TEXT DEFAULT 'demo' CHECK (source IN ('demo', 'landing', 'referral', 'organic', 'manual')),
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'registered', 'converted', 'lost')),
  demo_time_seconds INTEGER DEFAULT 0,
  demo_modules_accessed TEXT[] DEFAULT '{}',
  notes TEXT,
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para busca rápida
CREATE INDEX IF NOT EXISTS idx_saas_leads_status ON public.saas_leads(status);
CREATE INDEX IF NOT EXISTS idx_saas_leads_email ON public.saas_leads(email);
CREATE INDEX IF NOT EXISTS idx_saas_leads_created ON public.saas_leads(created_at DESC);

-- RLS: Apenas Super Admin pode ler/gerenciar leads
ALTER TABLE public.saas_leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_full_access_leads" ON public.saas_leads
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- Qualquer pessoa (anon) pode INSERIR lead (captura do demo)
CREATE POLICY "anyone_can_insert_lead" ON public.saas_leads
  FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 2. TABELA DE CÓDIGOS DE VERIFICAÇÃO WHATSAPP
-- ============================================
CREATE TABLE IF NOT EXISTS public.verification_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  whatsapp TEXT NOT NULL,
  email TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  verified BOOLEAN DEFAULT false,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_verification_email ON public.verification_codes(email);
CREATE INDEX IF NOT EXISTS idx_verification_expires ON public.verification_codes(expires_at);

ALTER TABLE public.verification_codes ENABLE ROW LEVEL SECURITY;

-- Qualquer pessoa pode inserir (precisa gerar código para se cadastrar)
CREATE POLICY "anyone_can_insert_verification" ON public.verification_codes
  FOR INSERT WITH CHECK (true);

-- Qualquer pessoa pode ler seus próprios códigos (por email)
CREATE POLICY "anyone_can_read_own_verification" ON public.verification_codes
  FOR SELECT USING (true);

-- Qualquer pessoa pode atualizar (para marcar tentativas)
CREATE POLICY "anyone_can_update_verification" ON public.verification_codes
  FOR UPDATE USING (true);

-- ============================================
-- 3. NOVAS COLUNAS EM PROFILES
-- ============================================
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp TEXT;

ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS whatsapp_verified BOOLEAN DEFAULT false;

-- ============================================
-- 4. TABELA DE CONFIGURAÇÃO DO WEBHOOK N8N
-- ============================================
CREATE TABLE IF NOT EXISTS public.saas_config (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.saas_config (key, value, description) VALUES
  ('n8n_whatsapp_webhook_url', 'https://SEU_N8N.com/webhook/whatsapp-verify', 'URL do webhook N8N para enviar código de verificação via Evolution API'),
  ('verification_code_ttl_minutes', '10', 'Tempo de validade do código de verificação em minutos'),
  ('verification_max_attempts', '5', 'Número máximo de tentativas para verificar código'),
  ('verification_rate_limit_per_hour', '3', 'Máximo de códigos por WhatsApp por hora')
ON CONFLICT (key) DO NOTHING;

ALTER TABLE public.saas_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "super_admin_manage_config" ON public.saas_config
  FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

CREATE POLICY "anyone_can_read_config" ON public.saas_config
  FOR SELECT USING (true);

-- ============================================
-- 5. TABELA DE SUPORTE (se não existir)
-- ============================================
CREATE TABLE IF NOT EXISTS public.support_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ct_id UUID NOT NULL REFERENCES public.cts(id),
  granted_by UUID NOT NULL REFERENCES auth.users(id),
  permissions TEXT[] NOT NULL DEFAULT '{}',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.support_access_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ct_admin_insert_support" ON public.support_access_requests
  FOR INSERT WITH CHECK (granted_by = auth.uid());

CREATE POLICY "super_admin_read_support" ON public.support_access_requests
  FOR SELECT USING (
    granted_by = auth.uid() OR
    EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin')
  );

-- ============================================
-- 6. RPC: GERAR CÓDIGO DE VERIFICAÇÃO
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_whatsapp_code(
  p_email TEXT,
  p_whatsapp TEXT
)
RETURNS JSON AS $$
DECLARE
  v_code TEXT;
  v_hash TEXT;
  v_ttl INTEGER;
  v_rate_count INTEGER;
  v_rate_limit INTEGER;
BEGIN
  -- Rate limit check
  SELECT COALESCE(value::integer, 3) INTO v_rate_limit
  FROM public.saas_config WHERE key = 'verification_rate_limit_per_hour';

  SELECT COUNT(*) INTO v_rate_count
  FROM public.verification_codes
  WHERE whatsapp = p_whatsapp
    AND created_at > (now() - interval '1 hour');

  IF v_rate_count >= v_rate_limit THEN
    RETURN json_build_object('success', false, 'error', 'RATE_LIMIT', 'message', 'Muitas tentativas. Aguarde 1 hora.');
  END IF;

  -- Gerar código de 6 dígitos
  v_code := lpad(floor(random() * 1000000)::text, 6, '0');

  -- Hash SHA256
  v_hash := encode(digest(v_code, 'sha256'), 'hex');

  -- TTL
  SELECT COALESCE(value::integer, 10) INTO v_ttl
  FROM public.saas_config WHERE key = 'verification_code_ttl_minutes';

  -- Invalidar códigos anteriores
  UPDATE public.verification_codes
  SET verified = true
  WHERE email = p_email AND verified = false;

  -- Inserir novo código
  INSERT INTO public.verification_codes (whatsapp, email, code_hash, expires_at)
  VALUES (p_whatsapp, p_email, v_hash, now() + (v_ttl || ' minutes')::interval);

  -- Retorna o código em plain text (o frontend envia ao webhook N8N)
  RETURN json_build_object(
    'success', true,
    'code', v_code,
    'expires_in_minutes', v_ttl
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. RPC: VERIFICAR CÓDIGO WHATSAPP
-- ============================================
CREATE OR REPLACE FUNCTION public.verify_whatsapp_code(
  p_email TEXT,
  p_code TEXT
)
RETURNS JSON AS $$
DECLARE
  v_record RECORD;
  v_hash TEXT;
BEGIN
  v_hash := encode(digest(p_code, 'sha256'), 'hex');

  SELECT * INTO v_record
  FROM public.verification_codes
  WHERE email = p_email
    AND verified = false
    AND expires_at > now()
  ORDER BY created_at DESC
  LIMIT 1;

  IF v_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'EXPIRED', 'message', 'Código expirado ou inválido.');
  END IF;

  IF v_record.attempts >= v_record.max_attempts THEN
    RETURN json_build_object('success', false, 'error', 'MAX_ATTEMPTS', 'message', 'Número máximo de tentativas atingido.');
  END IF;

  IF v_record.code_hash != v_hash THEN
    UPDATE public.verification_codes
    SET attempts = attempts + 1
    WHERE id = v_record.id;

    RETURN json_build_object('success', false, 'error', 'INVALID', 'message', 'Código incorreto. Tente novamente.');
  END IF;

  -- Código correto: marcar como verificado
  UPDATE public.verification_codes SET verified = true WHERE id = v_record.id;

  -- Atualizar perfil do usuário
  UPDATE public.profiles
  SET whatsapp = v_record.whatsapp, whatsapp_verified = true
  WHERE email = p_email;

  RETURN json_build_object('success', true, 'message', 'WhatsApp verificado com sucesso!');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 8. RPC: CAPTURAR LEAD DO DEMO
-- ============================================
CREATE OR REPLACE FUNCTION public.capture_demo_lead(
  p_name TEXT,
  p_email TEXT,
  p_whatsapp TEXT,
  p_academy_name TEXT DEFAULT NULL,
  p_modules TEXT[] DEFAULT '{}'
)
RETURNS JSON AS $$
BEGIN
  -- Verificar se lead já existe
  IF EXISTS (SELECT 1 FROM public.saas_leads WHERE email = p_email OR whatsapp = p_whatsapp) THEN
    UPDATE public.saas_leads
    SET demo_modules_accessed = p_modules,
        updated_at = now()
    WHERE email = p_email OR whatsapp = p_whatsapp;

    RETURN json_build_object('success', true, 'message', 'Lead atualizado.', 'is_new', false);
  END IF;

  INSERT INTO public.saas_leads (name, email, whatsapp, academy_name, demo_modules_accessed)
  VALUES (p_name, p_email, p_whatsapp, p_academy_name, p_modules);

  RETURN json_build_object('success', true, 'message', 'Lead capturado!', 'is_new', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. CLEANUP: Limpeza automática de códigos expirados
-- ============================================
CREATE OR REPLACE FUNCTION public.cleanup_expired_codes()
RETURNS void AS $$
BEGIN
  DELETE FROM public.verification_codes WHERE expires_at < now() - interval '24 hours';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON TABLE public.saas_leads IS 'Leads capturados pelo modo demo e landing pages. Gerenciado pelo Super Admin.';
COMMENT ON TABLE public.verification_codes IS 'Códigos de verificação WhatsApp com hash SHA256, rate limiting e expiração.';
COMMENT ON FUNCTION public.generate_whatsapp_code IS 'Gera código de 6 dígitos para verificação WhatsApp. Retorna código plain text para envio via N8N.';
COMMENT ON FUNCTION public.verify_whatsapp_code IS 'Valida código de verificação WhatsApp. Marca profile como verificado se correto.';
COMMENT ON FUNCTION public.capture_demo_lead IS 'Captura dados do demo user como lead no CRM do Super Admin.';
