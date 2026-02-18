-- ==========================================
-- FINAL_FIX_DASHBOARD_AND_CANTINA.sql
-- Solução definitiva para Dashboard e Cantina
-- ==========================================

-- 1. CORREÇÃO DASHBOARD (Erro 42501 na Feature Flags)
-- Liberar leitura pública para flags globais
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Flags - Leitura Geral" ON public.feature_flags;
CREATE POLICY "Flags - Leitura Geral" ON public.feature_flags FOR SELECT TO authenticated USING (true);

-- 2. CORREÇÃO CANTINA (Erro de Permissão Products)
-- Liberar Super Admin explicitamente
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Produtos - Super Admin" ON public.products;
DROP POLICY IF EXISTS "Produtos - Leitura" ON public.products;

CREATE POLICY "Produtos - Super Admin" ON public.products 
FOR ALL TO authenticated USING (public.is_super_admin());

CREATE POLICY "Produtos - Leitura" ON public.products 
FOR SELECT TO authenticated USING (true);

-- 3. GARANTIR FUNÇÕES NO SCHEMA CORRETO
-- Recriar as funções helper para ter certeza que não sumiram
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb->'app_metadata'->>'role', '')::text;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean AS $$
  SELECT public.get_my_role() = 'super_admin';
$$ LANGUAGE sql STABLE;

SELECT 'Correção Final Aplicada: Flags e Produtos desbloqueados.' as status;
