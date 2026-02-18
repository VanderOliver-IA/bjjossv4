-- ==========================================
-- SEED_DEMO_MODE.sql
-- Criação de Academia Fantasma e Usuários de Teste para Landing Page
-- ==========================================

-- 1. CRIAR CT DE DEMONSTRAÇÃO (Se não existir)
INSERT INTO public.cts (id, name, slug, subscription, subscription_status, modules, active)
VALUES (
    'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', -- ID fixo válido
    'Dojo Digital Demo Gym',
    'demo-gym',
    'enterprise',
    'ativo',
    '{"cantina": true, "financeiro": true, "crm": true, "eventos": true}',
    true
) ON CONFLICT (id) DO NOTHING;

-- 2. CRIAR USUÁRIOS FANTASMA (Login via Magic Link ou Senha Padrão)
-- Como não podemos criar Auth Users via SQL puro (segurança Supabase), 
-- vamos inserir apenas os PERFIS Fakes assumindo que o Auth User será criado/mapeado via Script JS ou manualmente.
-- Para este exercício, vamos usar IDs de placeholder para os perfis, e o script de Login Demo (frontend) fará a mágica.

INSERT INTO public.profiles (id, user_id, ct_id, name, email, bio)
VALUES 
    ('d3m0-user-dad0-cafe-babe-00000001', 'd3m0-user-dad0-cafe-babe-00000001', 'd3m0-beef-cafe-babe-000000000000', 'Mestre Demo (Dono)', 'demo.dono@bjjoss.com', 'Dono da demo gym'),
    ('d3m0-user-dad0-cafe-babe-00000002', 'd3m0-user-dad0-cafe-babe-00000002', 'd3m0-beef-cafe-babe-000000000000', 'Professor Demo', 'demo.prof@bjjoss.com', 'Professor da demo gym')
ON CONFLICT (id) DO NOTHING;

-- 3. POPULAR DADOS FAKE PARA A DEMO FICAR "BONITA"

-- Alunos (20 Fictícios)
INSERT INTO public.students (ct_id, name, status, email)
SELECT 
    'd3m0-beef-cafe-babe-000000000000',
    'Aluno Demo ' || i,
    CASE WHEN i % 5 = 0 THEN 'inativo' ELSE 'ativo' END,
    'aluno' || i || '@demo.com'
FROM generate_series(1, 20) i
ON CONFLICT DO NOTHING;

-- Transações Financeiras (Para o gráfico ficar bonito)
INSERT INTO public.financial_transactions (ct_id, type, amount, status, created_at)
SELECT 
    'd3m0-beef-cafe-babe-000000000000',
    'mensalidade',
    (random() * 200 + 100)::decimal(10,2),
    'pago',
    now() - (i || ' days')::interval
FROM generate_series(1, 50) i
ON CONFLICT DO NOTHING;

-- Produtos Cantina
INSERT INTO public.products (ct_id, name, price, stock, category) VALUES
('d3m0-beef-cafe-babe-000000000000', 'Açaí Demo 500ml', 25.00, 100, 'cantina'),
('d3m0-beef-cafe-babe-000000000000', 'Kimono Demo Pro', 450.00, 10, 'loja'),
('d3m0-beef-cafe-babe-000000000000', 'Água Mineral', 5.00, 200, 'cantina')
ON CONFLICT DO NOTHING;

-- Atribuir Roles (Permissões)
INSERT INTO public.user_roles (user_id, role) VALUES
('d3m0-user-dad0-cafe-babe-00000001', 'admin_ct'), -- Dono
('d3m0-user-dad0-cafe-babe-00000002', 'professor') -- Professor
ON CONFLICT DO NOTHING;

SELECT 'Ambiente de Demo (Dojo Digital) populado com sucesso!' as status;
