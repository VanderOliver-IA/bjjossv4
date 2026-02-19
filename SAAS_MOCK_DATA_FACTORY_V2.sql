-- ==========================================
-- SAAS_MOCK_DATA_FACTORY_V2.sql
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

-- 2. GERAÇÃO DE LEADS HISTÓRICOS
-- Usando INSERT regular para evitar erro de ON CONFLICT se não houver constraint de unicidade no email
DO $$ 
BEGIN
    -- Limpa para o mock não duplicar em testes sucessivos se necessário, ou apenas insere novos
    -- Aqui vamos apenas inserir se não existir o email (simulado)
    
    IF NOT EXISTS (SELECT 1 FROM public.saas_leads WHERE email = 'carlos.gracie@example.com') THEN
        INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
        VALUES ('Carlos Silva', 'carlos.gracie@example.com', '21988887777', 'organic', 'converted', 'Mestre interessado em migrar de planilha Excel. Fechou plano Pro!', '2025-10-15 10:00:00+00');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.saas_leads WHERE email = 'roberto.bjj@example.com') THEN
        INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
        VALUES ('Roberto Almeida', 'roberto.bjj@example.com', '21966665555', 'landing', 'converted', 'Aproveitou promoção de 1 ano. Academia com 150 alunos.', '2025-11-10 09:15:00+00');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.saas_leads WHERE email = 'andre.luiz@example.com') THEN
        INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
        VALUES ('Andre Luiz', 'andre.luiz@example.com', '11933332222', 'organic', 'converted', 'Upgrade de Trial para Pro após 7 dias.', '2025-12-28 10:00:00+00');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM public.saas_leads WHERE email = 'henrique.rocha@example.com') THEN
        INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
        VALUES ('Henrique Rocha', 'henrique.rocha@example.com', '41911110000', 'organic', 'converted', 'Pagamento via PIX anual realizado!', '2026-01-22 17:00:00+00');
    END IF;
    
    -- Inserir alguns novos/leads
    INSERT INTO public.saas_leads (name, email, whatsapp, source, status, notes, created_at)
    VALUES 
    ('Fabio Santos', 'fabio.mock@example.com', '11977776666', 'landing', 'lost', 'Achou o preço alto para 20 alunos.', '2025-10-20 14:30:00+00'),
    ('Lucas Mendes', 'lucas.mock@example.com', '31955554444', 'referral', 'contacted', 'Indicado pelo Mestre Carlos. Quer ver o financeiro.', '2025-11-25 16:45:00+00'),
    ('Marcos Andre', 'marcos.mock@example.com', '21944443333', 'landing', 'new', 'Lead capturado durante evento regional.', '2025-12-05 11:20:00+00'),
    ('Paulo Victor', 'pv.mock@example.com', '21922221111', 'landing', 'new', 'Dúvida sobre suporte offline.', '2026-01-15 13:40:00+00'),
    ('Vanessa Costa', 'vanessa.mock@example.com', '21888889999', 'landing', 'new', 'Como funciona o CRM de alunos?', '2026-02-05 10:10:00+00'),
    ('Tiago Ferraz', 'tiago.mock@example.com', '11877778888', 'demo', 'contacted', 'Testou o demo e perguntou sobre retenção.', '2026-02-12 15:20:00+00');
END $$;

-- 3. GERAÇÃO DE CTS HISTÓRICAS (Métricas de Crescimento)
-- Ajustado para as colunas reais: id, name, owner_id (opcional), subscription, subscription_status, address, phone, email, created_at
INSERT INTO public.cts (name, subscription, subscription_status, address, phone, email, created_at)
SELECT 
  'Academia ' || i,
  'pro',
  'ativo',
  'Endereço Mock ' || i,
  '21999999999',
  'academia' || i || '@mock.com',
  timestamp '2025-10-01' + (i || ' days')::interval
FROM generate_series(1, 20) s(i);

-- 4. CONFIGURAÇÕES SAAS PADRÃO
INSERT INTO public.saas_config (key, value, description) VALUES
  ('trial_period_days', '7', 'Duração do período de teste gratuito'),
  ('pro_plan_monthly_brl', '149.90', 'Preço mensal do plano PRO'),
  ('enterprise_min_students', '500', 'Quantidade mínima de alunos para plano Enterprise')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 5. RESET DE PERMISSÕES PARA O PERFIL (FIX INFINITE RECURSION)
DROP POLICY IF EXISTS "Profiles - Atualizar próprio perfil" ON public.profiles;
CREATE POLICY "Profiles - Atualizar próprio perfil" ON public.profiles
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

SELECT 'Massa de dados V2 gerada e RLS blindado!' as status;
