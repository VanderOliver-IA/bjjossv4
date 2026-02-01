-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin_ct', 'professor', 'atendente', 'aluno');

-- Create belt_type enum
CREATE TYPE public.belt_type AS ENUM ('branca', 'azul', 'roxa', 'marrom', 'preta');

-- Create subscription_type enum
CREATE TYPE public.subscription_type AS ENUM ('trial', 'basic', 'pro', 'enterprise');

-- Create subscription_status enum  
CREATE TYPE public.subscription_status AS ENUM ('ativo', 'inativo', 'pendente');

-- Create student_status enum
CREATE TYPE public.student_status AS ENUM ('ativo', 'inativo', 'experimental');

-- Create lead_status enum
CREATE TYPE public.lead_status AS ENUM ('novo', 'contatado', 'agendado', 'experimental', 'matriculado', 'perdido');

-- Create lead_source enum
CREATE TYPE public.lead_source AS ENUM ('instagram', 'facebook', 'indicacao', 'site', 'outros');

-- Create transaction_type enum
CREATE TYPE public.transaction_type AS ENUM ('mensalidade', 'cantina', 'loja', 'evento', 'outros');

-- Create payment_status enum
CREATE TYPE public.payment_status AS ENUM ('pago', 'pendente', 'atrasado');

-- Create payment_method enum
CREATE TYPE public.payment_method AS ENUM ('pix', 'cartao', 'dinheiro', 'boleto');

-- Create class_level enum
CREATE TYPE public.class_level AS ENUM ('iniciante', 'intermediario', 'avancado', 'todos');

-- Create event_type enum
CREATE TYPE public.event_type AS ENUM ('graduacao', 'campeonato', 'interno', 'seminario');

-- Create product_category enum
CREATE TYPE public.product_category AS ENUM ('cantina', 'loja');

-- Create cash_status enum
CREATE TYPE public.cash_status AS ENUM ('aberto', 'fechado');

-- Create cash_transaction_type enum
CREATE TYPE public.cash_transaction_type AS ENUM ('entrada', 'saida');

-- ====================================================
-- CTs (Centros de Treinamento) - Must be created first
-- ====================================================
CREATE TABLE public.cts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  cnpj TEXT,
  address TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  logo_url TEXT,
  subscription subscription_type NOT NULL DEFAULT 'trial',
  subscription_status subscription_status NOT NULL DEFAULT 'pendente',
  subscription_value DECIMAL(10,2) DEFAULT 0,
  subscription_due_day INTEGER DEFAULT 5,
  modules JSONB NOT NULL DEFAULT '{"alunos": true, "turmas": true, "presenca": true, "crm": true, "financeiro": true, "cantina": true, "eventos": true, "graduacao": true, "comunicacao": true, "relatorios": true}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- User Roles Table (separate from profiles for security)
-- ====================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

-- ====================================================
-- Profiles Table
-- ====================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  ct_id UUID REFERENCES public.cts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Students Table
-- ====================================================
CREATE TABLE public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  belt belt_type NOT NULL DEFAULT 'branca',
  stripes INTEGER NOT NULL DEFAULT 0 CHECK (stripes >= 0 AND stripes <= 4),
  photo_front TEXT,
  photo_left TEXT,
  photo_right TEXT,
  status student_status NOT NULL DEFAULT 'ativo',
  enrollment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  birth_date DATE,
  address TEXT,
  emergency_contact TEXT,
  responsible_name TEXT,
  responsible_phone TEXT,
  notes TEXT,
  balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  previous_ct TEXT,
  jj_start_date DATE,
  pause_periods JSONB,
  federated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Training Classes Table
-- ====================================================
CREATE TABLE public.training_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  professor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  schedule TEXT,
  days_of_week TEXT[] NOT NULL DEFAULT '{}',
  time_start TIME,
  time_end TIME,
  max_students INTEGER DEFAULT 30,
  level class_level NOT NULL DEFAULT 'todos',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Student Classes (Many-to-Many relationship)
-- ====================================================
CREATE TABLE public.student_classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.training_classes(id) ON DELETE CASCADE NOT NULL,
  enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (student_id, class_id)
);

-- ====================================================
-- Attendance Records Table
-- ====================================================
CREATE TABLE public.attendance_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  class_id UUID REFERENCES public.training_classes(id) ON DELETE SET NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  photo_url TEXT,
  visitors INTEGER DEFAULT 0,
  experimental INTEGER DEFAULT 0,
  notes TEXT,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Attendance Students (Many-to-Many)
-- ====================================================
CREATE TABLE public.attendance_students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attendance_id UUID REFERENCES public.attendance_records(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  recognized BOOLEAN DEFAULT false,
  UNIQUE (attendance_id, student_id)
);

-- ====================================================
-- Products Table
-- ====================================================
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category product_category NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  image_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Financial Transactions Table
-- ====================================================
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  type transaction_type NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  status payment_status NOT NULL DEFAULT 'pendente',
  due_date DATE,
  paid_date DATE,
  payment_method payment_method,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Daily Cash Table
-- ====================================================
CREATE TABLE public.daily_cash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  opening_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
  closing_balance DECIMAL(10,2),
  status cash_status NOT NULL DEFAULT 'aberto',
  closed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (ct_id, date)
);

-- ====================================================
-- Cash Transactions Table
-- ====================================================
CREATE TABLE public.cash_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  daily_cash_id UUID REFERENCES public.daily_cash(id) ON DELETE CASCADE NOT NULL,
  type cash_transaction_type NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  payment_method payment_method NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Events Table
-- ====================================================
CREATE TABLE public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  type event_type NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  location TEXT,
  price DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Event Participants (Many-to-Many)
-- ====================================================
CREATE TABLE public.event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  registered_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (event_id, student_id)
);

-- ====================================================
-- Graduation Records Table
-- ====================================================
CREATE TABLE public.graduation_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE NOT NULL,
  from_belt belt_type NOT NULL,
  to_belt belt_type NOT NULL,
  from_stripes INTEGER NOT NULL DEFAULT 0,
  to_stripes INTEGER NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  event_id UUID REFERENCES public.events(id) ON DELETE SET NULL,
  notes TEXT,
  awarded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Leads Table
-- ====================================================
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status lead_status NOT NULL DEFAULT 'novo',
  source lead_source NOT NULL DEFAULT 'outros',
  notes TEXT,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  last_contact DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Messages Table
-- ====================================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  from_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL NOT NULL,
  to_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Role Permissions (Admin CT controls module visibility)
-- ====================================================
CREATE TABLE public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  modules JSONB NOT NULL DEFAULT '{"alunos": true, "turmas": true, "presenca": true, "crm": false, "financeiro": false, "cantina": true, "eventos": true, "graduacao": true, "comunicacao": true, "relatorios": false}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (ct_id, role)
);

-- ====================================================
-- Dashboard Configurations (User preferences)
-- ====================================================
CREATE TABLE public.dashboard_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  cards JSONB DEFAULT '[]'::jsonb,
  charts JSONB DEFAULT '[]'::jsonb,
  layout JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Feature Flags (Super Admin only)
-- ====================================================
CREATE TABLE public.feature_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  enabled BOOLEAN DEFAULT false,
  ct_ids UUID[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Recurring Expenses (CT financials)
-- ====================================================
CREATE TABLE public.recurring_expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ct_id UUID REFERENCES public.cts(id) ON DELETE CASCADE NOT NULL,
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  due_day INTEGER NOT NULL CHECK (due_day >= 1 AND due_day <= 31),
  category TEXT NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ====================================================
-- Enable Row Level Security on all tables
-- ====================================================
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cash_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.event_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.graduation_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recurring_expenses ENABLE ROW LEVEL SECURITY;

-- ====================================================
-- Helper Functions (SECURITY DEFINER to avoid recursion)
-- ====================================================

-- Check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Check if user is super admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'super_admin')
$$;

-- Get user's profile
CREATE OR REPLACE FUNCTION public.get_user_profile()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Get user's CT ID
CREATE OR REPLACE FUNCTION public.get_user_ct_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ct_id FROM public.profiles WHERE user_id = auth.uid() LIMIT 1
$$;

-- Check if user is admin of a CT
CREATE OR REPLACE FUNCTION public.is_ct_admin(_ct_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p
    JOIN public.user_roles ur ON ur.user_id = p.user_id
    WHERE p.user_id = auth.uid() 
      AND p.ct_id = _ct_id 
      AND ur.role = 'admin_ct'
  )
$$;

-- Check if user can access CT (member of CT or super admin)
CREATE OR REPLACE FUNCTION public.can_access_ct(_ct_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_super_admin() OR 
         EXISTS (
           SELECT 1 FROM public.profiles 
           WHERE user_id = auth.uid() AND ct_id = _ct_id
         )
$$;

-- Check if user is professor of a class
CREATE OR REPLACE FUNCTION public.is_class_professor(_class_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.training_classes tc
    JOIN public.profiles p ON p.id = tc.professor_id
    WHERE tc.id = _class_id AND p.user_id = auth.uid()
  )
$$;

-- ====================================================
-- RLS Policies
-- ====================================================

-- CTs Policies
CREATE POLICY "Super admins can do everything with CTs" ON public.cts
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT members can view their CT" ON public.cts
  FOR SELECT USING (public.can_access_ct(id));

CREATE POLICY "CT admins can update their CT" ON public.cts
  FOR UPDATE USING (public.is_ct_admin(id));

-- User Roles Policies
CREATE POLICY "Super admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

-- Profiles Policies
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Super admins can manage all profiles" ON public.profiles
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT members can view profiles in their CT" ON public.profiles
  FOR SELECT USING (ct_id = public.get_user_ct_id());

CREATE POLICY "CT admins can manage profiles in their CT" ON public.profiles
  FOR ALL USING (public.is_ct_admin(ct_id));

-- Students Policies
CREATE POLICY "Super admins can manage all students" ON public.students
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT members can view students in their CT" ON public.students
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins can manage students" ON public.students
  FOR ALL USING (public.is_ct_admin(ct_id));

-- Training Classes Policies
CREATE POLICY "Super admins can manage all classes" ON public.training_classes
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT members can view classes" ON public.training_classes
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins can manage classes" ON public.training_classes
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "Professors can update their classes" ON public.training_classes
  FOR UPDATE USING (public.is_class_professor(id));

-- Student Classes Policies
CREATE POLICY "CT members can view student classes" ON public.student_classes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.can_access_ct(s.ct_id)
    )
  );

CREATE POLICY "CT admins can manage student classes" ON public.student_classes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.students s 
      WHERE s.id = student_id AND public.is_ct_admin(s.ct_id)
    )
  );

-- Attendance Records Policies
CREATE POLICY "Super admins can manage all attendance" ON public.attendance_records
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT members can view attendance" ON public.attendance_records
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins can manage attendance" ON public.attendance_records
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "Professors can manage attendance for their classes" ON public.attendance_records
  FOR ALL USING (public.is_class_professor(class_id));

-- Attendance Students Policies
CREATE POLICY "CT members can view attendance students" ON public.attendance_students
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.attendance_records ar 
      WHERE ar.id = attendance_id AND public.can_access_ct(ar.ct_id)
    )
  );

CREATE POLICY "CT admins and professors can manage attendance students" ON public.attendance_students
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.attendance_records ar 
      WHERE ar.id = attendance_id AND (public.is_ct_admin(ar.ct_id) OR public.is_class_professor(ar.class_id))
    )
  );

-- Products Policies
CREATE POLICY "CT members can view products" ON public.products
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins can manage products" ON public.products
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "Super admins can manage all products" ON public.products
  FOR ALL USING (public.is_super_admin());

-- Financial Transactions Policies
CREATE POLICY "Super admins can manage all transactions" ON public.financial_transactions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT admins can manage transactions" ON public.financial_transactions
  FOR ALL USING (public.is_ct_admin(ct_id));

-- Daily Cash Policies
CREATE POLICY "Super admins can manage all daily cash" ON public.daily_cash
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT admins can manage daily cash" ON public.daily_cash
  FOR ALL USING (public.is_ct_admin(ct_id));

-- Cash Transactions Policies
CREATE POLICY "CT admins can manage cash transactions" ON public.cash_transactions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.daily_cash dc 
      WHERE dc.id = daily_cash_id AND public.is_ct_admin(dc.ct_id)
    )
  );

-- Events Policies
CREATE POLICY "CT members can view events" ON public.events
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins can manage events" ON public.events
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "Super admins can manage all events" ON public.events
  FOR ALL USING (public.is_super_admin());

-- Event Participants Policies
CREATE POLICY "CT members can view event participants" ON public.event_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND public.can_access_ct(e.ct_id)
    )
  );

CREATE POLICY "CT admins can manage event participants" ON public.event_participants
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.events e 
      WHERE e.id = event_id AND public.is_ct_admin(e.ct_id)
    )
  );

-- Graduation Records Policies
CREATE POLICY "CT members can view graduations" ON public.graduation_records
  FOR SELECT USING (public.can_access_ct(ct_id));

CREATE POLICY "CT admins and professors can manage graduations" ON public.graduation_records
  FOR ALL USING (public.is_ct_admin(ct_id) OR public.is_super_admin());

-- Leads Policies
CREATE POLICY "Super admins can manage all leads" ON public.leads
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT admins can manage leads" ON public.leads
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "Assigned users can view their leads" ON public.leads
  FOR SELECT USING (assigned_to = public.get_user_profile());

-- Messages Policies
CREATE POLICY "Users can view their messages" ON public.messages
  FOR SELECT USING (
    from_profile_id = public.get_user_profile() OR 
    to_profile_id = public.get_user_profile()
  );

CREATE POLICY "Users can send messages" ON public.messages
  FOR INSERT WITH CHECK (from_profile_id = public.get_user_profile());

CREATE POLICY "Users can update their received messages" ON public.messages
  FOR UPDATE USING (to_profile_id = public.get_user_profile());

CREATE POLICY "CT admins can view CT messages" ON public.messages
  FOR SELECT USING (public.is_ct_admin(ct_id));

-- Role Permissions Policies
CREATE POLICY "Super admins can manage all role permissions" ON public.role_permissions
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT admins can manage their CT role permissions" ON public.role_permissions
  FOR ALL USING (public.is_ct_admin(ct_id));

CREATE POLICY "CT members can view role permissions" ON public.role_permissions
  FOR SELECT USING (public.can_access_ct(ct_id));

-- Dashboard Configs Policies
CREATE POLICY "Users can manage their own dashboard config" ON public.dashboard_configs
  FOR ALL USING (profile_id = public.get_user_profile());

-- Feature Flags Policies
CREATE POLICY "Super admins can manage feature flags" ON public.feature_flags
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "Everyone can view enabled feature flags" ON public.feature_flags
  FOR SELECT USING (enabled = true);

-- Recurring Expenses Policies
CREATE POLICY "Super admins can manage all expenses" ON public.recurring_expenses
  FOR ALL USING (public.is_super_admin());

CREATE POLICY "CT admins can manage their CT expenses" ON public.recurring_expenses
  FOR ALL USING (public.is_ct_admin(ct_id));

-- ====================================================
-- Triggers for updated_at
-- ====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_cts_updated_at BEFORE UPDATE ON public.cts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_classes_updated_at BEFORE UPDATE ON public.training_classes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_transactions_updated_at BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_permissions_updated_at BEFORE UPDATE ON public.role_permissions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_expenses_updated_at BEFORE UPDATE ON public.recurring_expenses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_flags_updated_at BEFORE UPDATE ON public.feature_flags
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_dashboard_configs_updated_at BEFORE UPDATE ON public.dashboard_configs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ====================================================
-- Trigger to create profile on user signup
-- ====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ====================================================
-- Storage bucket for photos
-- ====================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('photos', 'photos', true);

CREATE POLICY "Anyone can view photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'photos');

CREATE POLICY "Authenticated users can upload photos" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'photos' AND auth.role() = 'authenticated');

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE USING (bucket_id = 'photos' AND auth.uid()::text = (storage.foldername(name))[1]);