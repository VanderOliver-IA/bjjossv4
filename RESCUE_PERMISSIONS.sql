-- ==========================================
-- RESCUE_PERMISSIONS.sql
-- Correção de Permissões Básicas (GRANTs)
-- ==========================================

-- 1. CORREÇÃO DE PROPRIEDADE (OWNER)
-- Garantir que todas as tabelas pertençam ao postgres para evitar bloqueios
ALTER TABLE public.products OWNER TO postgres;
ALTER TABLE public.feature_flags OWNER TO postgres;
ALTER TABLE public.cts OWNER TO postgres;
ALTER TABLE public.profiles OWNER TO postgres;
ALTER TABLE public.financial_transactions OWNER TO postgres;

-- 2. GRANT ALL (Liberar Acesso Genérico)
-- Isso resolve o "Permission denied" em nível de tabela
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres;
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role; -- KEY FIX: Service Role precisa de tudo
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated; -- KEY FIX: Authenticated precisa de tudo (RLS filtra depois)
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, service_role, authenticated;

-- 3. REFORÇO DE RLS (Permissivo mas Seguro)
-- Products: Todos autenticados podem LER (pra comprar), Admins podem ESCREVER
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Rescue - Leitura Geral" ON public.products;
CREATE POLICY "Rescue - Leitura Geral" ON public.products FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Rescue - Escrita Admin" ON public.products;
CREATE POLICY "Rescue - Escrita Admin" ON public.products 
FOR ALL TO authenticated 
USING (public.is_super_admin() OR public.get_my_role() IN ('admin_ct', 'atendente'));

-- Feature Flags: Leitura Geral
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Rescue - Leitura Flags" ON public.feature_flags;
CREATE POLICY "Rescue - Leitura Flags" ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- 4. VERIFICAÇÃO DE INTEGRIDADE (Garantir que feature_flags tem dados)
INSERT INTO public.feature_flags (name, enabled, description) VALUES
('saas_metrics', true, 'Métricas globais'),
('multi_tenant_access', true, 'Acesso multi-CT')
ON CONFLICT (name) DO UPDATE SET enabled = EXCLUDED.enabled;

SELECT 'Permissões (GRANTs) restauradas para todas as roles!' as status;
