-- ====================================================================
-- MASTER REBUILD SCRIPT - BJJOSS V4 (PREMIUM)
-- ====================================================================

-- 0. Enable Essential Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Enum Types (Domain Logic)
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_ct', 'professor', 'atendente', 'aluno');
CREATE TYPE public.lead_status AS ENUM ('novo', 'contato', 'agendado', 'experimental', 'matriculado', 'perdido');
CREATE TYPE public.payment_method AS ENUM ('dinheiro', 'pix', 'cartao_credito', 'cartao_debito', 'boleto');
CREATE TYPE public.audit_action AS ENUM ('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT');


-- ====================================================================
-- CORE TABLES (Multi-tenant Structure)
-- ====================================================================

-- 2. CTs (Centros de Treinamento)
CREATE TABLE public.cts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  subscription TEXT DEFAULT 'standard', -- standard, premium, enterprise
  features JSONB DEFAULT '{}'::jsonb, -- active modules
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 3. Profiles (Extension of auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE, -- 1:1 with Auth User
  ct_id UUID REFERENCES public.cts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  phone TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 4. User Roles (RBAC)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- 5. Role Permissions (Module Access Control per CT)
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  modules JSONB NOT NULL DEFAULT '{"kanban": true, "financeiro": false, "qr_code": true}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(ct_id, role)
);


-- ====================================================================
-- BUSINESS DOMAIN TABLES
-- ====================================================================

-- 6. Students (Alunos)
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  cpf TEXT,
  birth_date DATE,
  status TEXT DEFAULT 'ativo', -- ativo, inativo, pendente
  graduation_level TEXT DEFAULT 'branca',
  checkin_code TEXT UNIQUE, -- for QR Code
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. Training Classes (Turmas)
CREATE TABLE public.training_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  description TEXT,
  sport TEXT DEFAULT 'jiu_jitsu',
  level TEXT DEFAULT 'todos',
  days INTEGER[] DEFAULT '{}', -- 0=Sun, 1=Mon...
  time_start TIME NOT NULL,
  time_end TIME NOT NULL,
  active BOOLEAN DEFAULT true
);

-- 8. Attendance (Presença)
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.training_classes(id) ON DELETE SET NULL,
  date DATE DEFAULT CURRENT_DATE,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE public.attendance_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'presente', -- presente, atrasado, justificado
  checkin_time TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(attendance_id, student_id)
);


-- ====================================================================
-- SALES & CRM (Power Features)
-- ====================================================================

-- 9. Products (Cantina/Loja)
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  cost_price DECIMAL(10,2),
  stock_quantity INTEGER DEFAULT 0,
  category TEXT DEFAULT 'geral', -- suplemento, kimono, bebida
  image_url TEXT,
  active BOOLEAN DEFAULT true
);

-- 10. Financial Transactions (Caixa)
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL, -- receita, despesa
  category TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_method payment_method,
  status TEXT DEFAULT 'concluido',
  date DATE DEFAULT CURRENT_DATE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 11. CRM Leads (Kanban)
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status lead_status DEFAULT 'novo',
  source TEXT DEFAULT 'site',
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_contact DATE,
  next_follow_up DATE,
  value_potential DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- ====================================================================
-- SECURITY & AUDIT (Enterprise Grade)
-- ====================================================================

-- 12. Audit Logs (Global Tracking)
CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action audit_action NOT NULL,
  table_name TEXT NOT NULL,
  record_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);


-- ====================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ====================================================================

ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financeiro ENABLE ROW LEVEL SECURITY; -- Conceptual alias
-- (Apply to all tables created above)

-- Basic Helper Functions for RLS
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles ur 
    WHERE ur.user_id = auth.uid() AND ur.role = 'super_admin'
  );
$$;

CREATE OR REPLACE FUNCTION public.get_user_ct_id()
RETURNS uuid LANGUAGE sql SECURITY DEFINER STABLE AS $$
  SELECT ct_id FROM public.profiles WHERE id = auth.uid();
$$;

-- Universal RLS Policy Example (Super Admin sees all, CT sees own)
CREATE POLICY "Super Admin Access" ON public.cts FOR ALL USING (public.is_super_admin());
CREATE POLICY "CT Member Access" ON public.cts FOR SELECT USING (id = public.get_user_ct_id());


-- ====================================================================
-- SEED DATA (Demo Environment)
-- ====================================================================

DO $$
DECLARE
    -- CT UUIDs
    ct_bsb UUID := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    ct_all UUID := 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22';
    ct_gb  UUID := 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33';
    
    -- User UUIDs (Must match auth.users if already exists, here we assume clean slate)
    -- Since we cannot insert into auth.users directly via SQL Editor without service_role permission in some contexts,
    -- this part might need to be done via API or Dashboard if SQL fails.
    -- However, standard Supabase SQL Editor allows auth.users inserts.
    
    uid_super      UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380s00';
    uid_admin_bsb  UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
    uid_prof_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380p11';
    uid_desk_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380d11';
    uid_stud_bsb   UUID := 'd0eebc99-9c0b-4ef8-bb6d-6bb9bd380u11';
    
    hashed_pw      TEXT := crypt('123456', gen_salt('bf'));

BEGIN
    -- 1. Insert CTs
    INSERT INTO public.cts (id, name, slug, subscription, features) VALUES
    (ct_bsb, 'Brasília BJJ Central', 'brasilia-bjj', 'enterprise', '{"crm": true, "financeiro": true}'),
    (ct_all, 'Alliance Jardins', 'alliance-jardins', 'premium', '{"valet": true}'),
    (ct_gb, 'Gracie Barra Sul', 'gb-sul', 'standard', '{}')
    ON CONFLICT DO NOTHING;

    -- 2. Insert Auth Users
    INSERT INTO auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, is_super_admin)
    VALUES 
    (uid_super, '00000000-0000-0000-0000-000000000000', 'super@bjjoss.com', hashed_pw, now(), '{"provider":"email","providers":["email"]}', '{"name":"Super Admin"}', now(), now(), 'authenticated', true),
    (uid_admin_bsb, '00000000-0000-0000-0000-000000000000', 'admin@brasilia.com', hashed_pw, now(), '{"provider":"email","providers":["email"]}', '{"name":"Ricardo Silva"}', now(), now(), 'authenticated', false),
    (uid_prof_bsb, '00000000-0000-0000-0000-000000000000', 'prof@brasilia.com', hashed_pw, now(), '{"provider":"email","providers":["email"]}', '{"name":"Rodrigo Santos"}', now(), now(), 'authenticated', false),
    (uid_desk_bsb, '00000000-0000-0000-0000-000000000000', 'atendente@brasilia.com', hashed_pw, now(), '{"provider":"email","providers":["email"]}', '{"name":"Maria Alves"}', now(), now(), 'authenticated', false),
    (uid_stud_bsb, '00000000-0000-0000-0000-000000000000', 'aluno@brasilia.com', hashed_pw, now(), '{"provider":"email","providers":["email"]}', '{"name":"João Aluno"}', now(), now(), 'authenticated', false)
    ON CONFLICT (id) DO NOTHING;

    -- 3. Insert Profiles
    INSERT INTO public.profiles (id, ct_id, name, email) VALUES
    (uid_super, NULL, 'Super Admin Global', 'super@bjjoss.com'),
    (uid_admin_bsb, ct_bsb, 'Ricardo Silva', 'admin@brasilia.com'),
    (uid_prof_bsb, ct_bsb, 'Rodrigo Santos', 'prof@brasilia.com'),
    (uid_desk_bsb, ct_bsb, 'Maria Alves', 'atendente@brasilia.com'),
    (uid_stud_bsb, ct_bsb, 'João Aluno', 'aluno@brasilia.com')
    ON CONFLICT (id) DO NOTHING;

    -- 4. Assign Roles
    INSERT INTO public.user_roles (user_id, role) VALUES
    (uid_super, 'super_admin'),
    (uid_admin_bsb, 'admin_ct'),
    (uid_prof_bsb, 'professor'),
    (uid_desk_bsb, 'atendente'),
    (uid_stud_bsb, 'aluno')
    ON CONFLICT DO NOTHING;

    -- 5. Seed Students (Bulk)
    INSERT INTO public.students (ct_id, name, email, status, graduation_level) VALUES
    (ct_bsb, 'Pedro Henrique', 'pedro@email.com', 'ativo', 'azul'),
    (ct_bsb, 'Ana Clara', 'ana@email.com', 'ativo', 'branca'),
    (ct_bsb, 'Marcos Paulo', 'marcos@email.com', 'inativo', 'roxa'),
    (ct_bsb, 'Fernanda Lima', 'fer@email.com', 'ativo', 'marrom'),
    (ct_all, 'Lucas Gurgel', 'lucas@alliance.com', 'ativo', 'preta')
    ON CONFLICT DO NOTHING;

    -- 6. Seed Classes
    INSERT INTO public.training_classes (ct_id, professor_id, name, time_start, time_end, days) VALUES
    (ct_bsb, uid_prof_bsb, 'Jiu Jitsu Manhã', '07:00', '08:30', '{1,3,5}'),
    (ct_bsb, uid_prof_bsb, 'No-Gi Submission', '19:00', '20:30', '{2,4}'),
    (ct_all, NULL, 'Competition Team', '12:00', '14:00', '{1,2,3,4,5}')
    ON CONFLICT DO NOTHING;
    
    -- 7. Seed Products
    INSERT INTO public.products (ct_id, name, price, stock_quantity, category) VALUES
    (ct_bsb, 'Açaí 500ml', 25.00, 50, 'alimentacao'),
    (ct_bsb, 'Água Mineral', 5.00, 100, 'bebidas'),
    (ct_bsb, 'Kimono A2 Branco', 450.00, 5, 'equipamentos')
    ON CONFLICT DO NOTHING;

END $$;
