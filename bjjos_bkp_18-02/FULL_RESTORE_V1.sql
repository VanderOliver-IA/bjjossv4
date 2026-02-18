-- ==========================================
-- FULL_RESTORE_V1.sql
-- Backup Completo do Banco de Dados BjjOss V1
-- Data: 18/02/2026
-- Contém: Schema, Funções, Policies (RLS), Seeds Essenciais
-- ==========================================

-- 1. LIMPEZA TOTAL (DROP CASCADE)
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO public;

-- 2. EXTENSÕES
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 3. TABELAS BASE (INFRAESTRUTURA)
CREATE TABLE public.cts (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL,
    slug text NOT NULL UNIQUE,
    subscription text NOT NULL CHECK (subscription IN ('free', 'starter', 'pro', 'enterprise')),
    subscription_status text NOT NULL DEFAULT 'ativo',
    modules jsonb DEFAULT '{}',
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.profiles (
    id uuid REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- redundancia util
    ct_id uuid REFERENCES public.cts(id),
    name text,
    email text,
    photo_url text,
    phone text,
    bio text,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE public.user_roles (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
    role text NOT NULL CHECK (role IN ('super_admin', 'admin_ct', 'professor', 'atendente', 'aluno')),
    created_at timestamptz DEFAULT now()
);

-- 4. TABELAS DE NEGÓCIO
CREATE TABLE public.students (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ct_id uuid REFERENCES public.cts(id) NOT NULL,
    name text NOT NULL,
    email text,
    status text DEFAULT 'ativo',
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.products (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ct_id uuid REFERENCES public.cts(id) ON DELETE CASCADE,
    name text NOT NULL,
    price decimal(10,2) NOT NULL DEFAULT 0,
    stock integer NOT NULL DEFAULT 0,
    category text NOT NULL CHECK (category IN ('cantina', 'loja')),
    active boolean DEFAULT true,
    created_at timestamptz DEFAULT now()
);

CREATE TABLE public.feature_flags (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    name text NOT NULL UNIQUE,
    enabled boolean DEFAULT true,
    description text
);

CREATE TABLE public.financial_transactions (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    ct_id uuid REFERENCES public.cts(id),
    type text NOT NULL,
    amount decimal(10,2) NOT NULL,
    status text DEFAULT 'pendente',
    created_at timestamptz DEFAULT now()
);

-- 5. FUNÇÕES HELPER (ESSENCIAIS PARA RLS)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE;

-- 6. POLÍTICAS DE SEGURANÇA (RLS BLINDADO)
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;

-- Policies Genéricas (Leitura Pública Autenticada para o MVP)
CREATE POLICY "Leitura Geral Authenticated" ON public.cts FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Geral Authenticated" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Geral Authenticated" ON public.products FOR SELECT TO authenticated USING (true);
CREATE POLICY "Leitura Geral Authenticated" ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- Policies Super Admin (Escrita Total)
CREATE POLICY "Super Admin Total" ON public.cts FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Super Admin Total" ON public.profiles FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Super Admin Total" ON public.products FOR ALL TO authenticated USING (public.is_super_admin());
CREATE POLICY "Super Admin Total" ON public.feature_flags FOR ALL TO authenticated USING (public.is_super_admin());

-- 7. SEED DATA (DADOS INICIAIS)
INSERT INTO public.cts (name, slug, subscription, subscription_status, modules) VALUES
('Brasília BJJ Central', 'brasilia-bjj', 'pro', 'ativo', '{"cantina": true, "financeiro": true}'),
('Alliance Jardins', 'alliance-jardins', 'starter', 'ativo', '{}'),
('Gracie Barra Sul', 'gracie-sul', 'enterprise', 'ativo', '{}');

INSERT INTO public.feature_flags (name, enabled, description) VALUES
('saas_metrics', true, 'Métricas globais'),
('multi_tenant_access', true, 'Acesso multi-CT'),
('facial_recognition', true, 'Reconhecimento Facial'),
('pix_integration', false, 'Pix V2');

INSERT INTO public.products (ct_id, name, price, stock, category) 
SELECT id, 'Açaí Natural 500ml', 25.00, 100, 'cantina' FROM public.cts WHERE slug = 'brasilia-bjj';

INSERT INTO public.products (ct_id, name, price, stock, category) 
SELECT id, 'Kimono Oficial GB', 450.00, 15, 'loja' FROM public.cts WHERE slug = 'brasilia-bjj';

-- 8. GRANT FINAL (PERMISSÕES POSTGRES)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, authenticated, service_role;

SELECT 'BACKUP RESTORE COMPLETO GERADO COM SUCESSO.' as status;
