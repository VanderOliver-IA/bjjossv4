-- ==========================================
-- SAAS_MOCK_DATA_FACTORY_2026.sql
-- Geração de massa de dados históricos (Out/25 - Fev/26)
-- Correção definitiva de RLS (Recursion Kill)
-- ==========================================

-- 1. CORREÇÃO DE RECURSÃO (BYPASS JWT)
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  -- Usa APENAS o JWT para evitar tocar em tabelas com RLS e causar recursão
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  -- Verificação direta e segura
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- 2. LIMPEZA DE DADOS EXISTENTES (Opcional, mas recomendado para o ambiente de dev)
-- DELETE FROM public.saas_leads WHERE source != 'demo';
-- DELETE FROM public.cts WHERE name LIKE 'Mock%';

-- 3. GERAÇÃO DE LEADS HISTÓRICOS
INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
VALUES 
-- Outubro (Crescimento Inicial)
('Carlos Silva', 'carlos.gracie@example.com', '21988887777', 'organic', 'converted', 'Mestre interessado em migrar de planilha Excel. Fechou plano Pro!', '2025-10-15 10:00:00+00'),
('Fabio Santos', 'fabio.santos@example.com', '11977776666', 'landing', 'lost', 'Achou o preço alto para 20 alunos.', '2025-10-20 14:30:00+00'),

-- Novembro (Black Friday Boost)
('Roberto Almeida', 'roberto.bjj@example.com', '21966665555', 'landing', 'converted', 'Aproveitou promoção de 1 ano. Academia com 150 alunos.', '2025-11-10 09:15:00+00'),
('Lucas Mendes', 'lucas.mendes@example.com', '31955554444', 'referral', 'contacted', 'Indicado pelo Mestre Carlos. Quer ver o financeiro.', '2025-11-25 16:45:00+00'),

-- Dezembro
('Marcos Andre', 'marcos.andre@example.com', '21944443333', 'landing', 'new', 'Lead capturado durante evento regional.', '2025-12-05 11:20:00+00'),
('Andre Luiz', 'andre.luiz@example.com', '11933332222', 'organic', 'converted', 'Upgrade de Trial para Pro após 7 dias.', '2025-12-28 10:00:00+00'),

-- Janeiro (New Year Resolve)
('Jessica Oliveira', 'jess.freitas@gmail.com', '21999887766', 'manual', 'new', 'Mestre querendo automatizar a graduação de faixas.', '2026-01-10 08:30:00+00'),
('Paulo Victor', 'pv.jiujitsu@example.com', '21922221111', 'landing', 'new', 'Dúvida sobre suporte offline.', '2026-01-15 13:40:00+00'),
('Henrique Rocha', 'henrique.rocha@example.com', '41911110000', 'organic', 'converted', 'Pagamento via PIX anual realizado!', '2026-01-22 17:00:00+00'),

-- Fevereiro (Atual)
('Vanessa Costa', 'vanessa.costa@example.com', '21888889999', 'landing', 'new', 'Como funciona o CRM de alunos?', '2026-02-05 10:10:00+00'),
('Tiago Ferraz', 'tiago.ferraz@example.com', '11877778888', 'demo', 'contacted', 'Testou o demo e perguntou sobre retenção.', '2026-02-12 15:20:00+00'),
('Bjj School Barra', 'contato@bjjschool.com', '21866667777', 'organic', 'new', 'Fusão de duas academias, precisam de 500 licenças.', '2026-02-18 09:00:00+00')
ON CONFLICT (email) DO NOTHING;

-- 4. GERAÇÃO DE CTS HISTÓRICAS (Métricas de Crescimento)
INSERT INTO public.cts (name, owner_id, status, subscription, created_at)
SELECT 
  'Academia ' || i,
  (SELECT id FROM auth.users LIMIT 1),
  'active',
  'pro',
  timestamp '2025-10-01' + (i || ' days')::interval
FROM generate_series(1, 20) s(i)
ON CONFLICT DO NOTHING;

-- 5. CONFIGURAÇÕES SAAS PADRÃO
INSERT INTO public.saas_config (key, value, description) VALUES
  ('trial_period_days', '7', 'Duração do período de teste gratuito'),
  ('pro_plan_monthly_brl', '149.90', 'Preço mensal do plano PRO'),
  ('enterprise_min_students', '500', 'Quantidade mínima de alunos para plano Enterprise')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 6. RESET DE PERMISSÕES PARA O PERFIL (FIX INFINITE RECURSION)
-- Garante que o usuário logado consiga editar seu próprio perfil sem travar
DROP POLICY IF EXISTS "Profiles - Atualizar próprio perfil" ON public.profiles;
CREATE POLICY "Profiles - Atualizar próprio perfil" ON public.profiles
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

SELECT 'Massa de dados gerada e RLS blindado!' as status;
