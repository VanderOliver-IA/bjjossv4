-- ====================================================================
-- FINAL REBUILD 2026 - BJJOSS V4 (ESTÁVEL)
-- ====================================================================

-- 1. Extensões
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Enums
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_ct', 'professor', 'atendente', 'aluno');
CREATE TYPE public.lead_status AS ENUM ('novo', 'contato', 'agendado', 'experimental', 'matriculado', 'perdido');
CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto');
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');

-- 3. Tabelas
CREATE TABLE public.cts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription TEXT DEFAULT 'standard',
  subscription_status TEXT DEFAULT 'ativo',
  features JSONB DEFAULT '{}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.profiles (
  id UUID PRIMARY KEY, -- REFERENCES auth.users(id) - omitido para facilidade de rebuild
  ct_id UUID REFERENCES public.cts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'ativo',
  graduation_level TEXT DEFAULT 'branca',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.training_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  days INTEGER[] DEFAULT '{}'
);

CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_method payment_method,
  status TEXT DEFAULT 'concluido',
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status lead_status DEFAULT 'novo',
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. Funções e Triggers (CORRIGIDOS)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Helper Functions para RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'super_admin');
$$;

CREATE OR REPLACE FUNCTION public.get_user_ct_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public AS $$
  SELECT ct_id FROM public.profiles WHERE id = auth.uid();
$$;

-- 6. Habilitar RLS e Policies Básicas
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Admin All" ON public.cts FOR ALL USING (public.is_super_admin());
CREATE POLICY "User View Own CT" ON public.cts FOR SELECT USING (id = public.get_user_ct_id());

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Own Profile" ON public.profiles FOR ALL USING (id = auth.uid() OR public.is_super_admin());

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "View Roles" ON public.user_roles FOR SELECT USING (user_id = auth.uid() OR public.is_super_admin());

-- 7. SEED DATA
INSERT INTO public.cts (id, name, slug, subscription) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brasília BJJ Central', 'brasilia-bjj', 'enterprise'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Alliance Jardins', 'alliance-jardins', 'premium'),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Gracie Barra Sul', 'gb-sul', 'standard');

-- (Dados de Students, Classes, etc serão criados automaticamente nas próximas etapas)
