-- ==========================================
-- BJJOSS_SAAS_CONSOLIDATED_FIX.sql
-- 1. Reparo de Schema (Colunas faltantes)
-- 2. Correção de RLS (Eliminar Recursão)
-- 3. Geração de Dados Históricos (BI Dashboard)
-- 4. Atualização da RPC de Ativação
-- ==========================================

-- [PASSO 1] REPARO DE SCHEMA
-- Garante que as colunas que o Dashboard e a RPC esperam existam na tabela REAL
DO $$ 
BEGIN 
    -- Na tabela CTS
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='cts' AND column_name='address') THEN
        ALTER TABLE public.cts ADD COLUMN address TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='cts' AND column_name='phone') THEN
        ALTER TABLE public.cts ADD COLUMN phone TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='cts' AND column_name='email') THEN
        ALTER TABLE public.cts ADD COLUMN email TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='cts' AND column_name='subscription_status') THEN
        ALTER TABLE public.cts ADD COLUMN subscription_status TEXT DEFAULT 'ativo';
    END IF;
    
    -- Na tabela PROFILES
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name='profiles' AND column_name='whatsapp_verified') THEN
        ALTER TABLE public.profiles ADD COLUMN whatsapp_verified BOOLEAN DEFAULT false;
    END IF;
END $$;

-- [PASSO 2] CORREÇÃO DE RECURSÃO RLS
-- Função ultraleve que lê apenas o JWT (sem tocar em tabelas)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT (current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Reset de Políticas Críticas (Profiles e User Roles)
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;

DO $$ 
DECLARE 
    pol RECORD;
BEGIN
    FOR pol IN (SELECT policyname, tablename FROM pg_policies WHERE schemaname = 'public' AND tablename IN ('profiles', 'user_roles')) LOOP
        EXECUTE 'DROP POLICY IF EXISTS ' || quote_ident(pol.policyname) || ' ON ' || quote_ident(pol.tablename);
    END LOOP;
END $$;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Super Admin Tudo" ON public.profiles FOR ALL TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "Ver próprio perfil" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Atualizar próprio perfil" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

CREATE POLICY "Super Admin Roles" ON public.user_roles FOR ALL TO authenticated USING (public.get_my_role() = 'super_admin');
CREATE POLICY "Ver próprio papel" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- [PASSO 3] GERAÇÃO DE DADOS HISTÓRICOS (Out/25 - Ago/26)
-- Limpeza para o SEED ser limpo
-- DELETE FROM public.saas_leads WHERE email LIKE '%@mock.com';

INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
VALUES 
('Carlos Silva', 'carlos.gracie@mock.com', '21988887777', 'organic', 'converted', 'Mestre interessado em migrar de planilha Excel. Fechou plano Pro!', '2025-10-15 10:00:00+00'),
('Roberto Almeida', 'roberto.bjj@mock.com', '21966665555', 'landing', 'converted', 'Aproveitou promoção de 1 ano. Academia com 150 alunos.', '2025-11-10 09:15:00+00'),
('Andre Luiz', 'andre.luiz@mock.com', '11933332222', 'organic', 'converted', 'Upgrade de Trial para Pro após 7 dias.', '2025-12-28 10:00:00+00'),
('Henrique Rocha', 'henrique.rocha@mock.com', '41911110000', 'organic', 'converted', 'Pagamento via PIX anual realizado!', '2026-01-22 17:00:00+00'),
('Fabio Santos', 'fabio.mock@mock.com', '11977776666', 'landing', 'lost', 'Achou o preço alto para 20 alunos.', '2025-10-20 14:30:00+00'),
('Lucas Mendes', 'lucas.mock@mock.com', '31955554444', 'referral', 'contacted', 'Indicado pelo Mestre Carlos. Quer ver o financeiro.', '2025-11-25 16:45:00+00'),
('Vanessa Costa', 'vanessa.mock@mock.com', '21888889999', 'landing', 'new', 'Como funciona o CRM de alunos?', '2026-02-05 10:10:00+00'),
('Tiago Ferraz', 'tiago.mock@mock.com', '11877778888', 'demo', 'contacted', 'Testou o demo e perguntou sobre retenção.', '2026-02-12 15:20:00+00')
ON CONFLICT DO NOTHING;

-- Gerar 20 Academias com SLUGS válidos e datas variadas
INSERT INTO public.cts (name, slug, subscription, subscription_status, address, phone, email, created_at)
SELECT 
  'Academia ' || i,
  'academia-mock-' || i || '-' || floor(random()*1000),
  'pro',
  'ativo',
  'Endereço Mock ' || i,
  '21999999999',
  'academia' || i || '@mock.com',
  timestamp '2025-10-01' + (i || ' days')::interval
FROM generate_series(1, 20) s(i)
ON CONFLICT DO NOTHING;

-- [PASSO 4] ATUALIZAÇÃO DA RPC DE ATIVAÇÃO
CREATE OR REPLACE FUNCTION public.activate_lead_account(p_lead_id UUID, p_gym_name TEXT)
RETURNS JSONB AS $$
DECLARE
    v_lead RECORD;
    v_user_id UUID;
    v_ct_id UUID;
    v_slug TEXT;
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

    -- Gerar slug
    v_slug := lower(regexp_replace(p_gym_name, '[^a-zA-Z0-9]', '-', 'g')) || '-' || floor(random()*1000);

    -- 3. Criar a Academia (CT)
    INSERT INTO public.cts (name, slug, address, phone, email, subscription, subscription_status, created_at)
    VALUES (p_gym_name, v_slug, 'Endereço a definir', v_lead.whatsapp, v_lead.email, 'pro', 'ativo', now())
    RETURNING id INTO v_ct_id;

    -- 4. Vincular usuário, dar cargo e marcar WHATSAPP_VERIFIED
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

-- CONFIGURAÇÕES SAAS PADRÃO
INSERT INTO public.saas_config (key, value, description) VALUES
  ('trial_period_days', '7', 'Duração do período de teste gratuito'),
  ('pro_plan_monthly_brl', '149.90', 'Preço mensal do plano PRO'),
  ('n8n_whatsapp_webhook_url', 'https://SEU_N8N.com/webhook', 'URL do webhook N8N')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

SELECT 'Saneamento TOTAL Concluído! Colunas reparadas, Recursão morta e Dados gerados.' as status;
