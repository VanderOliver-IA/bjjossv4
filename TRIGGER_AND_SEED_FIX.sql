-- ====================================================================
-- CORREÇÃO DEFINITIVA DO TRIGGER + SEED DE DADOS
-- Cole e execute no SQL Editor do Supabase
-- ====================================================================

-- 1. CORRIGIR A FUNÇÃO DO TRIGGER (usa 'id' não 'user_id')
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. DESABILITAR RLS PARA INSERIR DADOS
ALTER TABLE public.cts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.students DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads DISABLE ROW LEVEL SECURITY;

-- 3. INSERIR CTs
INSERT INTO public.cts (id, name, slug, subscription, active)
VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Brasília BJJ Central', 'brasilia-bjj', 'enterprise', true),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Alliance Jardins', 'alliance-jardins', 'premium', true),
  ('c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Gracie Barra Sul', 'gb-sul', 'standard', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. INSERIR PROFILES (usando 'id', não 'user_id')
INSERT INTO public.profiles (id, ct_id, name, email)
VALUES
  ('d0eebc99-1111-4ef8-bb6d-6bb9bd380f00', NULL,                                        'Super Admin Global',  'super@bjjoss.com'),
  ('d0eebc99-2222-4ef8-bb6d-6bb9bd380a11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',     'Ricardo Silva',       'admin@brasilia.com'),
  ('d0eebc99-3333-4ef8-bb6d-6bb9bd380e11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',     'Rodrigo Santos',      'prof@brasilia.com'),
  ('d0eebc99-4444-4ef8-bb6d-6bb9bd380d11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',     'Maria Alves',         'atendente@brasilia.com'),
  ('d0eebc99-5555-4ef8-bb6d-6bb9bd380c11', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',     'João Aluno',          'aluno@brasilia.com')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, ct_id = EXCLUDED.ct_id;

-- 5. GARANTIR USER_ROLES
INSERT INTO public.user_roles (user_id, role)
VALUES
  ('d0eebc99-1111-4ef8-bb6d-6bb9bd380f00', 'super_admin'),
  ('d0eebc99-2222-4ef8-bb6d-6bb9bd380a11', 'admin_ct'),
  ('d0eebc99-3333-4ef8-bb6d-6bb9bd380e11', 'professor'),
  ('d0eebc99-4444-4ef8-bb6d-6bb9bd380d11', 'atendente'),
  ('d0eebc99-5555-4ef8-bb6d-6bb9bd380c11', 'aluno')
ON CONFLICT (user_id, role) DO NOTHING;

-- 6. SEED: Alunos
INSERT INTO public.students (ct_id, name, email, status, graduation_level) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Pedro Henrique', 'pedro@email.com', 'ativo', 'azul'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Ana Clara', 'ana@email.com', 'ativo', 'branca'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Marcos Paulo', 'marcos@email.com', 'inativo', 'roxa'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Fernanda Lima', 'fer@email.com', 'ativo', 'marrom'),
  ('b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Lucas Gurgel', 'lucas@alliance.com', 'ativo', 'preta')
ON CONFLICT DO NOTHING;

-- 7. SEED: Turmas
INSERT INTO public.training_classes (ct_id, professor_id, name, time_start, time_end, days) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-3333-4ef8-bb6d-6bb9bd380e11', 'Jiu Jitsu Manhã', '07:00', '08:30', '{1,3,5}'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'd0eebc99-3333-4ef8-bb6d-6bb9bd380e11', 'No-Gi Submission', '19:00', '20:30', '{2,4}')
ON CONFLICT DO NOTHING;

-- 8. SEED: Transações Financeiras
INSERT INTO public.financial_transactions (ct_id, type, category, amount, description, status, date) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'receita', 'mensalidade', 350.00, 'Mensalidade Pedro Henrique', 'concluido', CURRENT_DATE - 5),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'receita', 'mensalidade', 350.00, 'Mensalidade Ana Clara', 'concluido', CURRENT_DATE - 3),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'despesa', 'aluguel', 2500.00, 'Aluguel do espaço', 'concluido', CURRENT_DATE - 10),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'receita', 'mensalidade', 350.00, 'Mensalidade Fernanda Lima', 'pendente', CURRENT_DATE)
ON CONFLICT DO NOTHING;

-- 9. SEED: Leads CRM
INSERT INTO public.leads (ct_id, name, email, phone, status, source) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos Interessado', 'carlos@email.com', '61999990001', 'novo', 'instagram'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Beatriz Curiosa', 'beatriz@email.com', '61999990002', 'contato', 'site'),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Rafael Agendado', 'rafael@email.com', '61999990003', 'agendado', 'indicacao')
ON CONFLICT DO NOTHING;

-- 10. REABILITAR RLS
ALTER TABLE public.cts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- 11. VERIFICAÇÃO FINAL
SELECT 'CTs' as tabela, count(*) as registros FROM public.cts
UNION ALL SELECT 'Profiles', count(*) FROM public.profiles
UNION ALL SELECT 'User Roles', count(*) FROM public.user_roles
UNION ALL SELECT 'Students', count(*) FROM public.students
UNION ALL SELECT 'Classes', count(*) FROM public.training_classes
UNION ALL SELECT 'Financeiro', count(*) FROM public.financial_transactions
UNION ALL SELECT 'Leads', count(*) FROM public.leads;
